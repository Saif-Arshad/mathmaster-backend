const { PrismaClient } = require('@prisma/client');
const { generateLearning } = require('../utils/AI');

const db3 = new PrismaClient();




exports.getLevelsWithSublevels = async (_, res) => {
    try {
        const levels = await db3.levels.findMany({
            orderBy: { level_id: 'asc' },
        });
        res.json(levels);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error on get levels.' });
    }
};

exports.getUserQuestions = async (req, res) => {
    const { id } = req.params;
    console.log("🚀 ~ exports.getUserQuestions= ~ id:", id)

    try {
        const user = await db3.users.findUnique({
            where: { user_id: Number(id) },
        })
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        let currentUserLevel = user.currentLevel

        if (!currentUserLevel) {
            const levels = await db3.levels.findMany({
                orderBy: { level_id: 'asc' },
            })
            currentUserLevel = levels[0].level_name
        }
        const questions = await db3.questions.findMany({
            where: {
                level: {
                    level_name: currentUserLevel
                }
            },
            include: {
                level: true
            }
        });
        console.log("🚀 ~ exports.getUserQuestions= ~ questions:", questions)
        if (!questions) {
            return res.status(404).json({ message: 'No questions found for this user.' });
        }
        await generateLearning(questions, user.progress)
            .then((sortedQuestions) => {
                console.log("🚀 ~ .then ~ sortedQuestions:", sortedQuestions)
                const sortedQuestionsWithLevel = sortedQuestions.map((question) => {
                    const questionWithLevel = questions.find(q => q.question_id === question.questionId);
                    return {
                        ...questionWithLevel
                    };
                })
                console.log("🚀 ~ sortedQuestionsWithLevel ~ sortedQuestionsWithLevel:", sortedQuestionsWithLevel)
                res.json({ questions: sortedQuestionsWithLevel, user });
            })
            .catch((err) => {
                console.error(err);
                res.json({ questions: questions, user });

            });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }

}

exports.submitSubLevel = async (req, res) => {
    const { user_id, level_id, correct_answers, total_questions, quiz_score } = req.body;
    try {
        const subLevels = await db3.sublevels.findMany({
            where: {
                level_id: Number(level_id)
            },
            orderBy: { sublevel_id: 'asc' }
        });

        const performanceRecords = await db3.performance.findMany({
            where: {
                user_id: Number(user_id),
                level_id: Number(level_id)
            }
        });

        let targetSubLevel;
        if (performanceRecords.length > 0) {
            const completedSubLevelIds = performanceRecords.map(record => record.sublevel_id);
            targetSubLevel = subLevels.find(sub => !completedSubLevelIds.includes(sub.sublevel_id));
            if (!targetSubLevel) {
                return res.status(200).json({ message: "All sublevels completed for this level." });
            }
        } else {
            targetSubLevel = subLevels[0];
        }

        const newPerformance = await db3.performance.create({
            data: {
                user_id: Number(user_id),
                level_id: Number(level_id),
                sublevel_id: targetSubLevel.sublevel_id,
                correct_answers: 0,  
                total_questions: 0,  
                quiz_score: 0          
            }
        });

            

        return res.status(200).json({
            message: "Performance record created for sublevel.",
            performance: newPerformance
        });
    } catch (error) {
        res.status(400).json({ message: error.message || "Server error" });
    }
};


exports.addQuestion = async (req, res) => {
    try {
        const {
            level_id,
            question_text,
            game,

            colorUp_shape,
            colorUp_totalItem,
            colorUp_coloredCount,

            sort_order,
            sort_shape,
            sort_totalItem,

            box_shape,
            box_firstBoxCount,
            box_secondBoxCount,

            equation_shape,
            equation_operation,
            equation_finalBoxcount,
            equation_firstBoxCount,
            equation_secondBoxCount,
        } = req.body;


        const q = await db3.questions.create({
            data: {
                level_id: Number(level_id),
                question_text,
                game,

                colorUp_shape,
                colorUp_totalItem: colorUp_totalItem ? Number(colorUp_totalItem) : null,
                colorUp_coloredCount: colorUp_coloredCount ? Number(colorUp_coloredCount) : null,

                sort_order,
                sort_shape,
                sort_totalItem: sort_totalItem ? Number(sort_totalItem) : null,

                box_shape,
                box_firstBoxCount: box_firstBoxCount ? Number(box_firstBoxCount) : null,
                box_secondBoxCount: box_secondBoxCount ? Number(box_secondBoxCount) : null,

                equation_shape,
                equation_operation,
                equation_finalBoxcount: equation_finalBoxcount ? Number(equation_finalBoxcount) : null,
                equation_firstBoxCount: equation_firstBoxCount ? Number(equation_firstBoxCount) : null,
                equation_secondBoxCount: equation_secondBoxCount ? Number(equation_secondBoxCount) : null,
            },
        });

        res.json({ message: 'Question added.', question_id: q.question_id });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message || 'Server error on add question.' });
    }
};

exports.modifyQuestion = async (req, res) => {
    try {
        const { question_id } = req.params;


        const data = {
            ...req.body,
            level_id: req.body.level_id ? Number(req.body.level_id) : undefined,

            colorUp_totalItem: req.body.colorUp_totalItem ? Number(req.body.colorUp_totalItem) : undefined,
            colorUp_coloredCount: req.body.colorUp_coloredCount ? Number(req.body.colorUp_coloredCount) : undefined,
            sort_totalItem: req.body.sort_totalItem ? Number(req.body.sort_totalItem) : undefined,
            box_firstBoxCount: req.body.box_firstBoxCount ? Number(req.body.box_firstBoxCount) : undefined,
            box_secondBoxCount: req.body.box_secondBoxCount ? Number(req.body.box_secondBoxCount) : undefined,
            equation_finalBoxcount: req.body.equation_finalBoxcount ? Number(req.body.equation_finalBoxcount) : undefined,
            equation_firstBoxCount: req.body.equation_firstBoxCount ? Number(req.body.equation_firstBoxCount) : undefined,
            equation_secondBoxCount: req.body.equation_secondBoxCount ? Number(req.body.equation_secondBoxCount) : undefined,
        };

        await db3.questions.update({ where: { question_id: Number(question_id) }, data });
        res.json({ message: 'Question updated.' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message || 'Server error on modify question.' });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const { question_id } = req.params;
        await db3.questions.delete({ where: { question_id: Number(question_id) } });
        res.json({ message: 'Question deleted.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error on delete question.' });
    }
};

exports.GetAllQuestions = async (req, res) => {
    try {
        const { level_id, game } = req.query;

        const questions = await db3.questions.findMany({
            where: {
                level_id: level_id ? Number(level_id) : undefined,
                game: game ? game : undefined,
            },
            include: { level: true },
            orderBy: { question_id: 'asc' },
        });

        res.json(questions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error on get all questions.' });
    }
};
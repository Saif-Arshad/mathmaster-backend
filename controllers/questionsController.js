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
        if (user.is_blocked) {
            return res.status(403).json({ message: 'You are blocked.' });
        }

        let userSubLevel = user.currentSublevel;
        let currentUserLevel = user.currentLevel;
        console.log("🚀 ~ exports.getUserQuestions= ~ currentUserLevel:", currentUserLevel);

        if (!currentUserLevel) {
            const levels = await db3.levels.findMany({
                orderBy: { level_id: 'asc' },
                include: {
                    sublevels: true,
                },
            });

            if (levels.length > 0) {
                const firstLevel = levels[0];
                const sbIndex = firstLevel.sublevels.findIndex(
                    (item) => item.sublevel_id === user.currentSublevel
                );
                console.log("🚀 ~ exports.getUserQuestions= ~ sbIndex:", sbIndex)

                userSubLevel =
                    sbIndex > 0 ? firstLevel.sublevels[sbIndex - 1] : firstLevel.sublevels[0];

                currentUserLevel = firstLevel.level_name;
            }
        }
        let isLastSublevel = false;

        if (userSubLevel) {
            const levels = await db3.levels.findMany({
                orderBy: { level_id: 'asc' },
                include: {
                    sublevels: true,
                },
            });

            const currentLevel = levels.find(
                (level) => level.level_name === user.currentLevel
            );

            if (currentLevel && currentLevel.sublevels.length > 0) {
                const sbIndex = currentLevel.sublevels.findIndex(
                    (item) => item.sublevel_id === user.currentSublevel
                );
                console.log("🚀 ~ Current sublevel index:", sbIndex);

                isLastSublevel = sbIndex === currentLevel.sublevels.length - 1;
            }
        }


        const questions = await db3.questions.findMany({
            where: {
                level: {
                    level_name: currentUserLevel
                }
            },
            include: {
                level: true,
                hint: true
            }
        });
        console.log("🚀 ~ exports.getUserQuestions= ~ questions:", questions)
        if (questions.length == 0) {
            return res.status(404).json({ message: 'No questions found for this Level.' });
        }

        await generateLearning(questions, user.progress)
            .then((sortedQuestions) => {
                const sortedQuestionsWithLevel = sortedQuestions.map((question) => {
                    const questionWithLevel = questions.find(q => q.question_id === question.questionId);
                    return {
                        ...questionWithLevel
                    };
                })
                if (user.currentLevel) {

                    res.json({
                        questions: sortedQuestionsWithLevel.slice().reverse(), user: {
                            ...user, userSubLevel, isLastSublevel
                        }
                    });
                } else {

                    res.json({
                        questions: sortedQuestionsWithLevel, user: {
                            ...user, userSubLevel, isLastSublevel
                        }
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                res.json({
                    questions: questions, user: {
                        ...user, userSubLevel, isLastSublevel
                    }
                });
            });


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }

}
exports.getQuizQuestions = async (req, res) => {
    const { id } = req.params;
    console.log("🚀 ~ exports.getUserQuestions= ~ id:", id)

    try {
        const user = await db3.users.findUnique({
            where: { user_id: Number(id) },
        })
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (user.is_blocked) {
            return res.status(403).json({ message: 'You are blocked.' });
        }

        if (!user.currentLevel) {
            return res.status(400).json({ message: 'Please complete practice questions' });
        }




        const questions = await db3.questions.findMany({
            where: {
                isQuiz: true,
                level: {
                    level_name: user.currentLevel

                }
            },
            include: {
                level: true
            }
        });
        console.log("🚀 ~ exports.getQuizQuestions= ~ questions:", questions)
        if (!questions) {
            return res.status(404).json({ message: 'No questions found for this Level.' });
        }


        res.json({
            questions: questions, user: user
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }

}

exports.submitSubLevel = async (req, res) => {
    const { user_id, level_id, correct_answers, total_questions } = req.body;
    console.log("🚀 ~ exports.submitSubLevel= ~ user_id:", user_id);
    console.log("🚀 ~ exports.submitSubLevel= ~ total_questions:", total_questions);
    console.log("🚀 ~ exports.submitSubLevel= ~ correct_answers:", correct_answers);
    console.log("🚀 ~ exports.submitSubLevel= ~ level_id:", level_id);
    try {
        const subLevels = await db3.sublevels.findMany({
            where: {
                level_id: Number(level_id)
            },
            orderBy: { sublevel_id: 'asc' }
        });
        const level = await db3.levels.findUnique({
            where: { level_id: Number(level_id) }
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
                return res.status(200).json({
                    message: "All sublevels completed for this level.",
                    progress: 100,
                    isLastSubLevel: true
                });
            }
        } else {
            targetSubLevel = subLevels[0];
        }

        const newPerformance = await db3.performance.create({
            data: {
                user_id: Number(user_id),
                level_id: Number(level_id),
                sublevel_id: targetSubLevel.sublevel_id,
                correct_answers: correct_answers,
                total_questions: total_questions,
                quiz_score: Math.floor((correct_answers / total_questions) * 100)
            }
        });

        const updatedCompletedCount = performanceRecords.length + 1;
        const progressPercent = subLevels.length > 0
            ? Math.floor((updatedCompletedCount / subLevels.length) * 100)
            : 0;

        // Check if the target sublevel is the last in the level
        const isLastSubLevel = subLevels[subLevels.length - 1].sublevel_id === targetSubLevel.sublevel_id;

        const user = await db3.users.update({
            where: { user_id: Number(user_id) },
            data: {
                currentLevel: level.level_name,
                currentSublevel: Number(targetSubLevel.sublevel_id)
            }
        });

        return res.status(200).json({
            message: "Performance record created for sublevel.",
            performance: newPerformance,
            progress: progressPercent,
            isLastSubLevel: isLastSubLevel
        });
    } catch (error) {
        res.status(400).json({ message: error.message || "Server error" });
    }
};
exports.submitQuiz = async (req, res) => {
    const { user_id, level_id, correct_answers, total_questions } = req.body;
    console.log("🚀 ~ exports.submitQuiz= ~ user_id:", user_id);
    console.log("🚀 ~ exports.submitQuiz= ~ total_questions:", total_questions);
    console.log("🚀 ~ exports.submitQuiz= ~ correct_answers:", correct_answers);
    console.log("🚀 ~ exports.submitQuiz= ~ level_id:", level_id);
    try {

        const newPerformance = await db3.performance.create({
            data: {
                user_id: Number(user_id),
                level_id: Number(level_id),
                sublevel_id: Number(level_id),
                correct_answers: correct_answers,
                total_questions: total_questions,
                quiz_score: Math.floor((correct_answers / total_questions) * 100)
            }
        });

        const progressPercent = 0;

        const levels = await db3.levels.findMany({
            orderBy: { level_id: 'asc' },
            include: {
                sublevels: {
                    orderBy: { sublevel_id: 'asc' }
                }
            }
        });

        const currentLevelIndex = levels.findIndex(l => l.level_id === Number(level_id));

        let nextLevelName = null;
        let nextSubLevelId = null;

        if (currentLevelIndex !== -1 && currentLevelIndex < levels.length - 1) {
            const nextLevel = levels[currentLevelIndex + 1];
            nextLevelName = nextLevel.level_name;
            nextSubLevelId = nextLevel.sublevels.length > 0 ? nextLevel.sublevels[0].sublevel_id : null;
        }

        const user = await db3.users.update({
            where: { user_id: Number(user_id) },
            data: {
                currentLevel: nextLevelName,
                currentSublevel: null
            }
        });

        return res.status(200).json({
            message: "Performance record created for sublevel.",
            performance: newPerformance,
            progress: progressPercent,
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
            isQuiz,
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
        console.log(req.body)

        const q = await db3.questions.create({
            data: {
                level_id: Number(level_id),
                question_text,
                game,
                isQuiz: isQuiz ? Boolean(isQuiz) : false,
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
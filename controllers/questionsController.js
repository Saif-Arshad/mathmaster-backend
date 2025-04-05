const { PrismaClient } = require('@prisma/client');

const db3 = new PrismaClient();


const ensureQuizOrSublevel = (isQuiz, sublevel_id) => {
    if (isQuiz || sublevel_id) return true;
    throw new Error('Either "isQuiz" must be true or a "sublevel_id" must be provided.');
};


exports.getLevelsWithSublevels = async (_, res) => {
    try {
        const levels = await db3.levels.findMany({
            include: { sublevels: true },
            orderBy: { level_id: 'asc' },
        });
        res.json(levels);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error on get levels.' });
    }
};


exports.addQuestion = async (req, res) => {
    try {
        const {
            level_id,
            sublevel_id,
            isQuiz,
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

        ensureQuizOrSublevel(isQuiz, sublevel_id);

        const q = await db3.questions.create({
            data: {
                level_id: Number(level_id),
                sublevel_id: isQuiz ? null : sublevel_id ? Number(sublevel_id) : null,
                isQuiz: Boolean(isQuiz),
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
        const { isQuiz, sublevel_id } = req.body;

        ensureQuizOrSublevel(isQuiz, sublevel_id);

        const data = {
            ...req.body,
            level_id: req.body.level_id ? Number(req.body.level_id) : undefined,
            sublevel_id: isQuiz ? null : req.body.sublevel_id ? Number(req.body.sublevel_id) : null,
            isQuiz: Boolean(isQuiz),

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
        const { level_id, sublevel_id, game, isQuiz } = req.query;

        const questions = await db3.questions.findMany({
            where: {
                level_id: level_id ? Number(level_id) : undefined,
                sublevel_id: sublevel_id ? Number(sublevel_id) : undefined,
                game: game ? game : undefined,
                isQuiz: isQuiz !== undefined ? Boolean(isQuiz === 'true') : undefined,
            },
            include: { level: true, sublevel: true },
            orderBy: { question_id: 'asc' },
        });

        res.json(questions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error on get all questions.' });
    }
};
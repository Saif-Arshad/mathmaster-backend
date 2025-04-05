const InitialQuiz = require('../models/InitialQuiz');

const numericKeys = [
    'colorUp_totalItem',
    'colorUp_coloredCount',
    'sort_totalItem',
    'box_firstBoxCount',
    'box_secondBoxCount',
    'equation_finalBoxcount',
    'equation_firstBoxCount',
    'equation_secondBoxCount',
];

const missing = (f) => `Missing required field: ${f}`;

function validate(body) {
    const { question_text, game } = body;
    if (!question_text) return missing('question_text');
    if (!game) return missing('game');

    switch (game) {
        case 'Color Up Game':
            if (!body.colorUp_shape) return missing('colorUp_shape');
            if (!body.colorUp_totalItem) return missing('colorUp_totalItem');
            if (!body.colorUp_coloredCount) return missing('colorUp_coloredCount');
            break;

        case 'Sort Game':
            if (!body.sort_shape) return missing('sort_shape');
            if (!body.sort_totalItem) return missing('sort_totalItem');
            if (!body.sort_order) return missing('sort_order'); 
            break;
        case 'Box Game':
            if (!body.box_shape) return missing('box_shape');
            if (!body.box_firstBoxCount) return missing('box_firstBoxCount');
            if (!body.box_secondBoxCount) return missing('box_secondBoxCount');
            break;

        case 'Equation Game':
            if (!body.equation_shape) return missing('equation_shape');
            if (!body.equation_operation) return missing('equation_operation');
            if (!body.equation_finalBoxcount) return missing('equation_finalBoxcount');
            if (!body.equation_firstBoxCount) return missing('equation_firstBoxCount');
            if (!body.equation_secondBoxCount) return missing('equation_secondBoxCount');
            break;

        default:
            return 'Unknown game type.';
    }
    return null;
}

function castNumerics(obj) {
    numericKeys.forEach((k) => {
        if (obj[k] === '') obj[k] = null;
        else if (obj[k] != null) obj[k] = Number(obj[k]);
    });
}


const initialQuizController = {
    async createQuestion(req, res) {
        try {
            const err = validate(req.body);
            if (err) return res.status(400).json({ message: err });

            castNumerics(req.body);

            const quiz_id = await InitialQuiz.createQuestion(req.body);
            res.status(201).json({ message: 'Question created successfully.', quiz_id });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Server error while creating question.' });
        }
    },

    async getAllQuestions(_req, res) {
        try {
            const questions = await InitialQuiz.getAllQuestions();
            res.json(questions);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Server error while fetching questions.' });
        }
    },

    async getQuestionById(req, res) {
        try {
            const question = await InitialQuiz.getQuestionById(req.params.id);
            if (!question) return res.status(404).json({ message: 'Question not found.' });
            res.json(question);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Server error while fetching the question.' });
        }
    },

    async updateQuestion(req, res) {
        try {
            const err = validate(req.body);
            if (err) return res.status(400).json({ message: err });

            castNumerics(req.body);

            await InitialQuiz.updateQuestion(req.params.id, req.body);
            res.json({ message: 'Question updated successfully.' });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Server error while updating the question.' });
        }
    },

    async deleteQuestion(req, res) {
        try {
            await InitialQuiz.deleteQuestion(req.params.id);
            res.json({ message: 'Question deleted successfully.' });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Server error while deleting the question.' });
        }
    },
};

module.exports = initialQuizController;


const InitialQuiz = require('../models/InitialQuiz');

const initialQuizController = {
    createQuestion: async (req, res) => {
        try {
            const { question_text, option_a, option_b, option_c, option_d, correct_option } = req.body;
            if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option)
                return res.status(400).json({ message: 'All fields are required.' });
            const quiz_id = await InitialQuiz.createQuestion({ question_text, option_a, option_b, option_c, option_d, correct_option });
            res.status(201).json({ message: 'Question created successfully.', quiz_id });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error while creating question.' });
        }
    },

    getAllQuestions: async (req, res) => {
        try {
            const questions = await InitialQuiz.getAllQuestions();
            res.json(questions);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error while fetching questions.' });
        }
    },

    getQuestionById: async (req, res) => {
        try {
            const { id } = req.params;
            const question = await InitialQuiz.getQuestionById(id);
            if (!question) return res.status(404).json({ message: 'Question not found.' });
            res.json(question);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error while fetching the question.' });
        }
    },

    updateQuestion: async (req, res) => {
        try {
            const { id } = req.params;
            const { question_text, option_a, option_b, option_c, option_d, correct_option } = req.body;
            await InitialQuiz.updateQuestion(id, { question_text, option_a, option_b, option_c, option_d, correct_option });
            res.json({ message: 'Question updated successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error while updating the question.' });
        }
    },

    deleteQuestion: async (req, res) => {
        try {
            const { id } = req.params;
            await InitialQuiz.deleteQuestion(id);
            res.json({ message: 'Question deleted successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error while deleting the question.' });
        }
    }
};

module.exports = initialQuizController;

const db5 = require('../config/db');

const practiceController = {
    getPracticeQuestion: async (req, res) => {
        try {
            const questionArr = await db5.$queryRaw`SELECT * FROM questions ORDER BY RAND() LIMIT 1`;
            if (!questionArr.length) return res.status(404).json({ message: 'No questions found.' });
            res.json(questionArr[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on get practice question.' });
        }
    },

    getHint: async (req, res) => {
        try {
            const { question_id } = req.params;
            const hintArr = await db5.hints.findMany({ where: { question_id: Number(question_id) }, take: 1 });
            if (!hintArr.length) return res.status(404).json({ message: 'No hint found for this question.' });
            res.json(hintArr[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on get hint.' });
        }
    },

    submitAnswer: async (req, res) => {
        try {
            const { question_id, answer } = req.body;
            const q = await db5.questions.findUnique({ where: { question_id: Number(question_id) }, select: { correct_answer: true } });
            if (!q) return res.status(404).json({ message: 'Question not found.' });
            const isCorrect = answer.toString().trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
            // TODO: log performance
            res.json({ message: isCorrect ? 'Correct answer!' : 'Wrong answer!', correctAnswer: q.correct_answer });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on submit practice answer.' });
        }
    }
};

module.exports = practiceController;

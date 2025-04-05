
const db6 = require('../config/db');

const quizController = {
    startQuiz: async (req, res) => {
        try {
            const questions = await db6.$queryRaw`SELECT * FROM questions ORDER BY RAND() LIMIT 10`;
            if (!questions.length) return res.status(404).json({ message: 'No questions available for quiz.' });
            res.json({ questions });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on start quiz.' });
        }
    },

    submitQuiz: async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const { responses } = req.body; // [{question_id, user_answer}]
            let correctCount = 0;
            for (const r of responses) {
                const q = await db6.questions.findUnique({ where: { question_id: r.question_id }, select: { correct_answer: true } });
                if (q && r.user_answer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) correctCount++;
            }
            const total = responses.length;
            const score = (correctCount / total) * 100;
            await db6.performance.create({ data: { user_id, level_id: 1, correct_answers: correctCount, total_questions: total, quiz_score: score } });
            const level = await db6.levels.findUnique({ where: { level_id: 1 }, select: { min_passing_percentage: true } });
            const passed = score >= level.min_passing_percentage;
            res.json({ message: 'Quiz submitted.', correctCount, total, score, passed });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on submit quiz.' });
        }
    },

    getQuizResult: async (req, res) => {
        try {
            const { performance_id } = req.params;
            const perf = await db6.performance.findUnique({ where: { performance_id: Number(performance_id) } });
            if (!perf) return res.status(404).json({ message: 'Performance not found.' });
            res.json(perf);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on get quiz result.' });
        }
    }
};

module.exports = quizController;

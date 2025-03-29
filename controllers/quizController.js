// controllers/quizController.js
const db = require('../config/db');

const quizController = {
    // Start quiz (get 10 questions randomly or relevant to user's level)
    startQuiz: async (req, res) => {
        try {
            const user_id = req.user.user_id;
            // Determine user level/sublevel
            // For demonstration, let's pick 10 random questions:
            const [rows] = await db.query(`SELECT * FROM questions ORDER BY RAND() LIMIT 10`);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'No questions available for quiz.' });
            }
            res.json({ questions: rows });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on start quiz.' });
        }
    },

    // Submit quiz
    submitQuiz: async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const { responses } = req.body;
            // `responses` is an array of objects: [{ question_id, user_answer }, ...]

            let correctCount = 0;
            const total = responses.length;

            // Compare each response
            for (const r of responses) {
                const [rows] = await db.query(
                    'SELECT correct_answer FROM questions WHERE question_id = ?',
                    [r.question_id]
                );
                if (rows && rows[0]) {
                    const correctAnswer = rows[0].correct_answer.trim().toLowerCase();
                    if (r.user_answer.trim().toLowerCase() === correctAnswer) {
                        correctCount++;
                    }
                }
            }

            const score = (correctCount / total) * 100;

            // Mark performance, store result
            // Suppose user is currently on a certain level
            // Save result in performance table
            // For demonstration:
            await db.query(
                'INSERT INTO performance (user_id, level_id, correct_answers, total_questions, quiz_score) VALUES (?,?,?,?,?)',
                [user_id, 1, correctCount, total, score] // just an example with level_id=1
            );

            // Check if user passed
            // For demonstration, we read min_passing_percentage from level 1
            const [levelRows] = await db.query(
                'SELECT min_passing_percentage FROM levels WHERE level_id = ?',
                [1]
            );
            const passPercent = levelRows[0].min_passing_percentage;

            let passed = false;
            if (score >= passPercent) {
                passed = true;
                // Move user to next level, or do something
            }

            // Return result with correct answers if needed
            res.json({
                message: 'Quiz submitted.',
                correctCount,
                total,
                score,
                passed
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on submit quiz.' });
        }
    },

    // Show quiz result (if you need a separate endpoint)
    getQuizResult: async (req, res) => {
        try {
            const { performance_id } = req.params;
            const [rows] = await db.query(`SELECT * FROM performance WHERE performance_id = ?`, [
                performance_id
            ]);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Performance not found.' });
            }
            res.json(rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on get quiz result.' });
        }
    }
};

module.exports = quizController;

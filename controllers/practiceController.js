const db = require('../config/db');

const practiceController = {
    // Get a practice question based on user level, difficulty, etc.
    getPracticeQuestion: async (req, res) => {
        try {
            const user_id = req.user.user_id;
            // 1) Find user's current level & sublevel
            // 2) Fetch a question from the DB with appropriate difficulty
            // For now, let's do a simple random example:
            const [rows] = await db.query(`SELECT * FROM questions ORDER BY RAND() LIMIT 1`);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'No questions found.' });
            }
            const question = rows[0];
            res.json(question);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on get practice question.' });
        }
    },

    // Provide a hint for the question
    getHint: async (req, res) => {
        try {
            const { question_id } = req.params;
            const [rows] = await db.query(
                'SELECT * FROM hints WHERE question_id = ? LIMIT 1',
                [question_id]
            );
            if (rows.length === 0) {
                return res.status(404).json({ message: 'No hint found for this question.' });
            }
            res.json(rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on get hint.' });
        }
    },

    // Submit practice answer
    submitAnswer: async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const { question_id, answer } = req.body;

            // Retrieve the correct answer from DB
            const [rows] = await db.query('SELECT correct_answer FROM questions WHERE question_id = ?', [
                question_id
            ]);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Question not found.' });
            }

            const correctAnswer = rows[0].correct_answer;
            let isCorrect = answer.toString().trim().toLowerCase() === correctAnswer.toString().trim().toLowerCase();

            // TODO: Log user performance, e.g.:
            // 1) Insert or update practice performance
            // 2) Adjust difficulty if needed
            // 3) Possibly show "Take the Quiz" if the user has answered enough

            res.json({
                message: isCorrect ? 'Correct answer!' : 'Wrong answer!',
                correctAnswer: correctAnswer
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on submit practice answer.' });
        }
    }
};

module.exports = practiceController;

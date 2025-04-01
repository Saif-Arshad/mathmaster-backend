const db = require('../config/db');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const adminController = {
    getAllUsers: async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM users');
            res.json(rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on get all users.' });
        }
    }, loginAdmin: async (req, res) => {
        try {
            const { email, password } = req.body;

            const [rows] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Admin not found.' });
            }
            const admin = rows[0];
            if (admin.password !== password) {
                return res.status(401).json({ message: 'Invalid email or password.' });
            }
            res.json({
                message: 'Login successful.',
                admin: admin
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on admin login.' });
        }
    },


    blockUser: async (req, res) => {
        try {
            const { user_id } = req.params;
            await User.blockUser(user_id);
            res.json({ message: 'User blocked successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on block user.' });
        }
    },

    unblockUser: async (req, res) => {
        try {
            const { user_id } = req.params;
            await User.unblockUser(user_id);
            res.json({ message: 'User unblocked successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on unblock user.' });
        }
    },

    setMinQuizPercentage: async (req, res) => {
        try {
            const { level_id } = req.params;
            const { percentage } = req.body;
            await db.query(
                'UPDATE levels SET min_passing_percentage = ? WHERE level_id = ?',
                [percentage, level_id]
            );
            res.json({ message: 'Minimum passing percentage updated.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on set min quiz percentage.' });
        }
    },

    addLevel: async (req, res) => {
        try {
            const { level_name, min_passing_percentage } = req.body;
            const [result] = await db.query(
                'INSERT INTO levels (level_name, min_passing_percentage) VALUES (?,?)',
                [level_name, min_passing_percentage]
            );
            res.json({ message: 'Level added.', level_id: result.insertId });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on add level.' });
        }
    },
    deleteLevel: async (req, res) => {
        try {
            const { level_id } = req.params;
            await db.query('DELETE FROM levels WHERE level_id = ?', [level_id]);
            res.json({ message: 'Level deleted.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on delete level.' });
        }
    },

    modifyLevel: async (req, res) => {
        try {
            const { level_id } = req.params;
            const { level_name, min_passing_percentage } = req.body;
            await db.query(
                'UPDATE levels SET level_name = ?, min_passing_percentage = ? WHERE level_id = ?',
                [level_name, min_passing_percentage, level_id]
            );
            res.json({ message: 'Level updated.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on modify level.' });
        }
    },

    addQuestion: async (req, res) => {
        try {
            const { level_id, sublevel_id, difficulty, question_text, correct_answer } = req.body;
            const [result] = await db.query(
                'INSERT INTO questions (level_id, sublevel_id, difficulty, question_text, correct_answer) VALUES (?,?,?,?,?)',
                [level_id, sublevel_id, difficulty, question_text, correct_answer]
            );
            res.json({ message: 'Question added.', question_id: result.insertId });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on add question.' });
        }
    },

    deleteQuestion: async (req, res) => {
        try {
            const { question_id } = req.params;
            await db.query('DELETE FROM questions WHERE question_id = ?', [question_id]);
            res.json({ message: 'Question deleted.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on delete question.' });
        }
    },

    modifyQuestion: async (req, res) => {
        try {
            const { question_id } = req.params;
            const { difficulty, question_text, correct_answer } = req.body;
            await db.query(
                'UPDATE questions SET difficulty = ?, question_text = ?, correct_answer = ? WHERE question_id = ?',
                [difficulty, question_text, correct_answer, question_id]
            );
            res.json({ message: 'Question updated.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on modify question.' });
        }
    },

    regradeQuiz: async (req, res) => {
        try {
            const { performance_id } = req.params;
            // Regrade logic here
            // ...
            res.json({ message: 'Quiz regraded (mock).' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on regrade quiz.' });
        }
    },
    generateReport: async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM performance');
            // You can shape this data for your reporting needs
            res.json(rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on generate report.' });
        }
    },

    sendEmailToUser: async (req, res) => {
        try {
            const { userEmail: email, userSubject:subject, userMessage: message } = req.body;

            if (!email || !subject || !message) {
                return res.status(400).json({ message: 'Email, subject, and message are required.' });
            }

            await sendEmail(email, subject, message);

            res.json({ message: 'Email sent successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on send email.' });
        }
    },
};

module.exports = adminController;

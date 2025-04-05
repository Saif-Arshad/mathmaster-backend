
const db3 = require('../config/db');
const UserModel = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const adminController = {
    getAllUsers: async (req, res) => {
        try {
            const users = await db3.users.findMany();
            res.json(users);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on get all users.' });
        }
    },

    loginAdmin: async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log("🚀 ~ loginAdmin: ~ password:", password)
            console.log("🚀 ~ loginAdmin: ~ email:", email)
            const admin = await db3.admins.findUnique({ where: { email } });
            if (!admin) return res.status(404).json({ message: 'Admin not found.' });
            console.log("🚀 ~ loginAdmin: ~ admin:", admin)
            if (admin.password !== password)
                return res.status(401).json({ message: 'Invalid email or password.' });
            res.json({ message: 'Login successful.', admin });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on admin login.' });
        }
    },

    blockUser: async (req, res) => {
        try {
            const { user_id } = req.params;
            await UserModel.blockUser(user_id);
            res.json({ message: 'User blocked successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on block user.' });
        }
    },

    unblockUser: async (req, res) => {
        try {
            const { user_id } = req.params;
            await UserModel.unblockUser(user_id);
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
            await db3.levels.update({
                where: { level_id: Number(level_id) },
                data: { min_passing_percentage: Number(percentage) }
            });
            res.json({ message: 'Minimum passing percentage updated.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on set min quiz percentage.' });
        }
    },

    getAllLevels: async (req, res) => {
        try {
            const levels = await db3.levels.findMany({ include: { sublevels: true } });
            res.json(levels);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on get all levels.' });
        }
    },

    addLevel: async (req, res) => {
        try {
            const { level_name, min_passing_percentage, discription } = req.body;
            const level = await db3.levels.create({
                data: { level_name, min_passing_percentage, discription }
            });
            res.json({ message: 'Level added.', level_id: level.level_id });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on add level.' });
        }
    },

    deleteLevel: async (req, res) => {
        try {
            const { level_id } = req.params;
            await db3.levels.delete({ where: { level_id: Number(level_id) } });
            res.json({ message: 'Level deleted.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on delete level.' });
        }
    },

    modifyLevel: async (req, res) => {
        try {
            const { level_id } = req.params;
            const { level_name, min_passing_percentage, discription } = req.body;
            await db3.levels.update({
                where: { level_id: Number(level_id) },
                data: { level_name, min_passing_percentage, discription }
            });
            res.json({ message: 'Level updated.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on modify level.' });
        }
    },

    getAllSubLevel: async (req, res) => {
        try {
            const subs = await db3.sublevels.findMany();
            res.json(subs);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on get all sublevels.' });
        }
    },

    addSubLevel: async (req, res) => {
        try {
            const { level_id, sublevel_discription } = req.body;
            if (!level_id || !sublevel_discription)
                return res.status(400).json({ message: 'Level ID and sublevel discription are required.' });
            const sub = await db3.sublevels.create({
                data: { level_id, sublevel_discription }
            });
            res.json({ message: 'Sublevel added.', sublevel_id: sub.sublevel_id });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on add sublevels.' });
        }
    },

    deleteSubLevel: async (req, res) => {
        try {
            const { sublevel_id } = req.params;
            await db3.sublevels.delete({ where: { sublevel_id: Number(sublevel_id) } });
            res.json({ message: 'Sublevel deleted.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on delete sublevels.' });
        }
    },

    modifySubLevel: async (req, res) => {
        try {
            const { sublevel_id } = req.params;
            const { level_id, sublevel_discription } = req.body;
            if (!level_id || !sublevel_discription)
                return res.status(400).json({ message: 'Level ID and sublevel discription are required.' });
            await db3.sublevels.update({
                where: { sublevel_id: Number(sublevel_id) },
                data: { level_id, sublevel_discription }
            });
            res.json({ message: 'Sublevel updated.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on modify sublevels.' });
        }
    },

    addQuestion: async (req, res) => {
        try {
            const { level_id, sublevel_id, difficulty, question_text, correct_answer } = req.body;
            const q = await db3.questions.create({
                data: { level_id, sublevel_id, difficulty, question_text, correct_answer }
            });
            res.json({ message: 'Question added.', question_id: q.question_id });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on add question.' });
        }
    },

    deleteQuestion: async (req, res) => {
        try {
            const { question_id } = req.params;
            await db3.questions.delete({ where: { question_id: Number(question_id) } });
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
            await db3.questions.update({
                where: { question_id: Number(question_id) },
                data: { difficulty, question_text, correct_answer }
            });
            res.json({ message: 'Question updated.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on modify question.' });
        }
    },

    regradeQuiz: async (req, res) => {
        try {
            const { performance_id } = req.params;
            // Regrading logic here...
            res.json({ message: 'Quiz regraded (mock).' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on regrade quiz.' });
        }
    },

    generateReport: async (req, res) => {
        try {
            const report = await db3.performance.findMany();
            res.json(report);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on generate report.' });
        }
    },

    sendEmailToUser: async (req, res) => {
        try {
            const { userEmail: email, userSubject: subject, userMessage: message } = req.body;
            if (!email || !subject || !message)
                return res.status(400).json({ message: 'Email, subject, and message are required.' });
            await sendEmail(email, subject, message);
            res.json({ message: 'Email sent successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on send email.' });
        }
    }
};

module.exports = adminController;
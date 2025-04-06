
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



    getAllLevels: async (req, res) => {
        try {
            const levels = await db3.levels.findMany({ include: { sublevels: true } });
            res.json(levels);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on get all levels.' });
        }
    },
    getAllLevels2: async (req, res) => {
        try {
            const user = await db3.users.findUnique({
                where: { user_id: Number(req.user.user_id) }
            });

            const currentLevel = user?.currentLevel; 
            const currentSub = user?.currentSublevel;
            console.log("🚀 ~ getAllLevels2: ~ currentLevel:", currentLevel);

            let levels = await db3.levels.findMany({ include: { sublevels: true } });
            levels.sort((a, b) => a.level_id - b.level_id);

            if (currentLevel ) {
                const normalizedCurrentLevel = currentLevel.trim().toLowerCase();
                const currentLevelIndex = levels.findIndex((level) =>
                    level.level_name.trim().toLowerCase() === normalizedCurrentLevel
                );
                console.log("🚀 ~ getAllLevels2: ~ currentLevelIndex:", currentLevelIndex)

                levels = levels.map((level, idx) => {
                    if (idx < currentLevelIndex) {
                        return {
                            ...level,
                            sublevels: level.sublevels.map((sub) => ({
                                ...sub,
                                isCompleted: true
                            }))
                        };
                    } else if (idx === currentLevelIndex) {
                        const currentSubIndex = level.sublevels.findIndex(
                            (sub) => sub.sublevel_id === currentSub
                        );
                        return {
                            ...level,
                            sublevels: level.sublevels.map((sub, sIdx) => ({
                                ...sub,
                                isCompleted: sIdx <= currentSubIndex
                            }))
                        };
                    } else {
                        return level;
                    }
                });
            }

            console.log(levels.filter((item) => item.level_id == 2)[0]?.sublevels);
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
                data: { level_name, min_passing_percentage: Number(min_passing_percentage), discription }
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
                data: { level_name, min_passing_percentage: Number(min_passing_percentage), discription }
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
                data: { level_id: Number(level_id), sublevel_discription }
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
                data: { level_id: Number(level_id), sublevel_discription }
            });
            res.json({ message: 'Sublevel updated.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on modify sublevels.' });
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

const UserModel2 = require('../models/User');
const db7 = require('../config/db');

const userController = {
    getProfile: async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const user = await UserModel2.findById(user_id);
            if (!user) return res.status(404).json({ message: 'User not found.' });

            delete user.password;
            if (user.currentLevel) {

                const performance = await db7.performance.findMany({
                    where: {
                        user_id,
                        level: {
                            level_name: user.currentLevel
                        }
                    },
                    select: {
                        sublevel_id: true
                    }
                });

                const completedSubLevels = performance.map((p) => p.sublevel);
                const allSubLevels = await db7.sublevels.findMany({
                    where: {
                        level: {
                            level_name: user.currentLevel
                        }
                    },
                    orderBy: { sublevel_id: 'asc' }
                });

                const progressPercent = allSubLevels.length > 0
                    ? Math.floor((completedSubLevels.length / allSubLevels.length) * 100)
                    : 0;

                user.progress = progressPercent;
            }
            else {
                user.progress = 0;
            }

            res.json(user);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on get profile.' });
        }
    },
    getUserInfo: async (req, res) => {
        try {
            const { id } = req.params;
            console.log("🚀 ~ getUserInfo: ~ id:", id)
            const user_id = Number(id);
            const user = await UserModel2.findById(user_id);
            if (!user) return res.status(404).json({ message: 'User not found.' });

            delete user.password;
            if (user.currentLevel) {

                const performance = await db7.performance.findMany({
                    where: {
                        user_id,
                        level: {
                            level_name: user.currentLevel
                        }
                    },
                    select: {
                        sublevel_id: true
                    }
                });

                const completedSubLevels = performance.map((p) => p.sublevel);
                const allSubLevels = await db7.sublevels.findMany({
                    where: {
                        level: {
                            level_name: user.currentLevel
                        }
                    },
                    orderBy: { sublevel_id: 'asc' }
                });

                const progressPercent = allSubLevels.length > 0
                    ? Math.floor((completedSubLevels.length / allSubLevels.length) * 100)
                    : 0;

                user.progress = progressPercent;
            }
            else {
                user.progress = 0;
            }
            user.progressData = await db7.performance.findMany({
                where: {
                    user_id,
                },
                include: {
                    level: true
                }
            })

            res.json(user);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on get profile.' });
        }
    },


    logout: async (req, res) => {
        try {
            res.json({ message: 'Logged out successfully (client should remove token).' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on logout.' });
        }
    },

    updateInitialPercentage: async (req, res) => {
        try {
            const { user_id, percentage } = req.body;
            if (!user_id || typeof percentage === 'undefined')
                return res.status(400).json({ message: 'User id and percentage are required.' });
            const parsedPercentage = parseInt(percentage, 10);
            if (isNaN(parsedPercentage))
                return res.status(400).json({ message: 'Percentage must be a number.' });
            const updated = await db7.users.update({
                where: { user_id },
                data: { initialPercentage: parsedPercentage }
            });
            if (!updated) return res.status(404).json({ message: 'User not found.' });
            res.json({ message: 'User initial percentage updated successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error while updating initial percentage.' });
        }
    }
};

module.exports = userController;
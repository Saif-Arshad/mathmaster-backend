// controllers/userController.js
const User = require('../models/User');
const db = require('../config/db');

const userController = {
    getProfile: async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const user = await User.findById(user_id);
            if (!user) return res.status(404).json({ message: 'User not found.' });

            delete user.password;
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
    updateInitialPercentage : async (req, res) => {
        try {
            const { user_id, percentage } = req.body;

            if (!user_id || typeof percentage === "undefined") {
                return res.status(400).json({ message: "User id and percentage are required." });
            }

            const parsedPercentage = parseInt(percentage, 10);
            if (isNaN(parsedPercentage)) {
                return res.status(400).json({ message: "Percentage must be a number." });
            }

            const [result] = await db.query(
                "UPDATE users SET initialPercentage = ? WHERE user_id = ?",
                [parsedPercentage, user_id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "User not found." });
            }

            res.json({ message: "User initial percentage updated successfully." });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error while updating initial percentage." });
        }
    },

};

module.exports = userController;

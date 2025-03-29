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
    }
};

module.exports = userController;

require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const db = require('../config/db');
const generateOTP = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');

const authController = {
    register: async (req, res) => {
        try {
            const { email, username, password, age } = req.body;
            console.log("🚀 ~ register: ~ email:", email)
            console.log("🚀 ~ register: ~ age:", age)
            console.log("🚀 ~ register: ~ password:", password)
            console.log("🚀 ~ register: ~ username:", username)

            if (!email || !username || !password || !age) {
                return res.status(400).json({ message: 'All fields are required.' });
            }

            const existingEmail = await User.findByEmail(email);
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already in use.' });
            }
            const existingUsername = await User.findByUsername(username);
            if (existingUsername) {
                return res.status(400).json({ message: 'Username already taken.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user_id = await User.createUser({ email, username, password: hashedPassword, age });

            const otpCode = generateOTP(6);
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
            await db.query(
                'INSERT INTO otps (user_id, code, expires_at) VALUES (?,?,?)',
                [user_id, otpCode, expiresAt]
            );

            await sendEmail(email, 'Your OTP Code', `Your OTP code is: ${otpCode}`);

            res.status(201).json({
                message: 'User registered successfully. Please verify OTP sent to your email.',
                user_id: user_id
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on registration.' });
        }
    },

    verifyOTP: async (req, res) => {
        try {
            const { user_id, code } = req.body;
            const [rows] = await db.query(
                'SELECT * FROM otps WHERE user_id = ? AND code = ? AND used = 0',
                [user_id, code]
            );
            const otpRow = rows[0];

            if (!otpRow) {
                return res.status(400).json({ message: 'Invalid OTP.' });
            }

            const now = new Date();
            if (now > otpRow.expires_at) {
                return res.status(400).json({ message: 'OTP has expired.' });
            }

            await db.query('UPDATE otps SET used = 1 WHERE otp_id = ?', [otpRow.otp_id]);
            const user = await db.query(`UPDATE users SET is_verified = 1 WHERE user_id = ?`, [user_id])

            res.json({ message: 'OTP verified successfully.', user });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on OTP verification.' });
        }
    },

    resendOTP: async (req, res) => {
        try {
            const { user_id } = req.body;

            const otpCode = generateOTP(6);
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

            await db.query('UPDATE otps SET used = 1 WHERE user_id = ?', [user_id]);

            await db.query(
                'INSERT INTO otps (user_id, code, expires_at) VALUES (?,?,?)',
                [user_id, otpCode, expiresAt]
            );

            const user = await User.findById(user_id);
            if (user) {
                await sendEmail(user.email, 'Your OTP Code (Resent)', `Your OTP code is: ${otpCode}`);
            }

            res.json({ message: 'OTP resent successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on resend OTP.' });
        }
    },

    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password are required.' });
            }

            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials.' });
            }

            if (user.is_blocked) {
                return res.status(403).json({ message: 'User is blocked. Contact admin.' });
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(400).json({ message: 'Invalid credentials.' });
            }

            if (!user.is_verified) {
                return res.status(401).json({ message: 'User not verified. Please verify OTP.' });
            }

            const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET || 'secretKey', {
                expiresIn: '1d'
            });

            res.json({
                message: 'Login successful.',
                token,
                user
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on login.' });
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findByEmail(email);

            if (!user) {
                return res.status(400).json({ message: 'User not found.' });
            }

            const otpCode = generateOTP(6);
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

            await db.query('UPDATE otps SET used = 1 WHERE user_id = ?', [user.user_id]); // invalidate old OTP
            await db.query(
                'INSERT INTO otps (user_id, code, expires_at) VALUES (?,?,?)',
                [user.user_id, otpCode, expiresAt]
            );
            const resetLink = `http://localhost:8080/new-password?otp=${otpCode}&userId=${user.user_id}`;
            await sendEmail(
                user.email, 
                'Reset Password OTP', 
                `Your reset password OTP code is: ${otpCode}\n\nOr click this link to reset your password: ${resetLink}`
            );

            res.json({ message: 'Reset password OTP sent to your email.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on forgot password.' });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { user_id, code, newPassword } = req.body;

            const [rows] = await db.query(
                'SELECT * FROM otps WHERE user_id = ? AND code = ? AND used = 0',
                [user_id, code]
            );
            const otpRow = rows[0];
            if (!otpRow) {
                return res.status(400).json({ message: 'Invalid or expired OTP.' });
            }

            const now = new Date();
            if (now > otpRow.expires_at) {
                return res.status(400).json({ message: 'OTP has expired.' });
            }

            await db.query('UPDATE otps SET used = 1 WHERE otp_id = ?', [otpRow.otp_id]);

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await db.query('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, user_id]);

            res.json({ message: 'Password reset successful.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on reset password.' });
        }
    }
};

module.exports = authController;

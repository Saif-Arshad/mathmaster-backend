
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const db4 = require('../config/db');
const generateOTP = require('../utils/generateOTP');
const sendEmail2 = require('../utils/sendEmail');

const authController = {
    register: async (req, res) => {
        try {
            const { email, username, password, age } = req.body;
            if (!email || !username || !password || !age)
                return res.status(400).json({ message: 'All fields are required.' });

            if (await User.findByEmail(email))
                return res.status(400).json({ message: 'Email already in use.' });
            if (await User.findByUsername(username))
                return res.status(400).json({ message: 'Username already taken.' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const user_id = await User.createUser({ email, username, password: hashedPassword, age });

            const otpCode = generateOTP(6);
            console.log("🚀 ~ register: ~ otpCode:", otpCode)
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
            await db4.otps.create({ data: { user_id, code: otpCode, expires_at: expiresAt } });

            await sendEmail2(email, 'Your OTP Code', `Your OTP code is: ${otpCode}`);

            res.status(201).json({
                message: 'User registered successfully. Please verify OTP sent to your email.',
                user_id
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on registration.' });
        }
    },

    verifyOTP: async (req, res) => {
        try {
            const { user_id, code } = req.body;
            const otpRow = await db4.otps.findFirst({
                where: { user_id: Number(user_id), code, used: false }
            });
            if (!otpRow) return res.status(400).json({ message: 'Invalid OTP.' });
            if (new Date() > otpRow.expires_at)
                return res.status(400).json({ message: 'OTP has expired.' });

            await db4.otps.update({ where: { otp_id: otpRow.otp_id }, data: { used: true } });
            await db4.users.update({ where: { user_id: Number(user_id) }, data: { is_verified: true } });
            const user = await User.findById(user_id);
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
            console.log("🚀 ~ resendOTP: ~ otpCode:", otpCode)
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
            await db4.otps.updateMany({ where: { user_id: Number(user_id) }, data: { used: true } });
            await db4.otps.create({ data: { user_id: Number(user_id), code: otpCode, expires_at: expiresAt } });

            const user = await User.findById(user_id);
            if (user) await sendEmail2(user.email, 'Your OTP Code (Resent)', `Your OTP code is: ${otpCode}`);
            res.json({ message: 'OTP resent successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on resend OTP.' });
        }
    },

    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password)
                return res.status(400).json({ message: 'Username and password are required.' });
            const user = await User.findByUsername(username);
            if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
            if (user.is_blocked) return res.status(403).json({ message: 'User is blocked. Contact admin.' });
            if (!(await bcrypt.compare(password, user.password)))
                return res.status(400).json({ message: 'Invalid credentials.' });
            if (!user.is_verified)
                return res.status(401).json({ message: 'User not verified. Please verify OTP.' });
            const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET || 'secretKey', {
                expiresIn: '1d'
            });
            res.json({ message: 'Login successful.', token, user });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on login.' });
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findByEmail(email);
            if (!user) return res.status(400).json({ message: 'User not found.' });
            const otpCode = generateOTP(6);
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
            await db4.otps.updateMany({ where: { user_id: user.user_id }, data: { used: true } });
            await db4.otps.create({ data: { user_id: user.user_id, code: otpCode, expires_at: expiresAt } });
            const resetLink = `http://localhost:3000/new-password?otp=${otpCode}&userId=${user.user_id}`;
            await sendEmail2(user.email, 'Reset Password OTP', `Your reset password OTP code is: ${otpCode}\n\nOr click this link to reset your password: ${resetLink}`);
            console.log("🚀 ~ forgotPassword: ~ resetLink:", resetLink)
            res.json({ message: 'Reset password OTP sent to your email.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on forgot password.' });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { user_id, code, newPassword } = req.body;
            const otpRow = await db4.otps.findFirst({
                where: { user_id: Number(user_id), code, used: false }
            });
            if (!otpRow) return res.status(400).json({ message: 'Invalid or expired OTP.' });
            if (new Date() > otpRow.expires_at)
                return res.status(400).json({ message: 'OTP has expired.' });
            await db4.otps.update({ where: { otp_id: otpRow.otp_id }, data: { used: true } });
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await db4.users.update({ where: { user_id: Number(user_id) }, data: { password: hashedPassword } });
            res.json({ message: 'Password reset successful.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on reset password.' });
        }
    }
};

module.exports = authController;
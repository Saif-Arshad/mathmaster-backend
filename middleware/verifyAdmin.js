// middleware/verifyAdmin.js
const jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Invalid token format.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKey');
        // Check if this user is in the admin table
        const [adminRows] = await db.query('SELECT * FROM admins WHERE admin_id = ?', [decoded.user_id]);
        if (adminRows.length === 0) {
            return res.status(403).json({ message: 'Admin privileges required.' });
        }

        req.admin = adminRows[0];
        next();
    } catch (err) {
        console.error(err);
        res.status(403).json({ message: 'Failed to verify admin token.' });
    }
};

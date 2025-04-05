
const jwt2 = require('jsonwebtoken');
const db8 = require('../config/db');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
        const token = authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Invalid token format.' });
        const decoded = jwt2.verify(token, process.env.JWT_SECRET || 'secretKey');
        const admin = await db8.admins.findUnique({ where: { admin_id: decoded.user_id } });
        if (!admin) return res.status(403).json({ message: 'Admin privileges required.' });
        req.admin = admin;
        next();
    } catch (err) {
        console.error(err);
        res.status(403).json({ message: 'Failed to verify admin token.' });
    }
};

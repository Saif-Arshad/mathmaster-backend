// middleware/verifyToken.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Invalid token format.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secretKey', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token.' });
        }
        // user will have { user_id, iat, exp }
        req.user = user;
        next();
    });
};

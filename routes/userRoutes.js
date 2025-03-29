// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken'); // see below

// Protected routes
router.get('/profile', verifyToken, userController.getProfile);
router.post('/logout', verifyToken, userController.logout);

module.exports = router;

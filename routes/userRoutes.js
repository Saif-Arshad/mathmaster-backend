// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken'); // see below

router.get('/profile', verifyToken, userController.getProfile);
router.post('/submit-inital', userController.updateInitialPercentage);
router.post('/logout', verifyToken, userController.logout);

module.exports = router;

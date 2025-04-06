const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken'); 

router.get('/profile', verifyToken, userController.getProfile);
router.get('/:id', userController.getUserInfo);
router.post('/submit-inital', userController.updateInitialPercentage);

module.exports = router;

// routes/practiceRoutes.js
const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practiceController');
const verifyToken = require('../middleware/verifyToken');

router.get('/question', verifyToken, practiceController.getPracticeQuestion);
router.post('/answer', verifyToken, practiceController.submitAnswer);

module.exports = router;

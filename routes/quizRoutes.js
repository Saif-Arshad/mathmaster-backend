// routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const verifyToken = require('../middleware/verifyToken');

router.get('/start', verifyToken, quizController.startQuiz);
router.post('/submit', verifyToken, quizController.submitQuiz);
router.get('/result/:performance_id', verifyToken, quizController.getQuizResult);

module.exports = router;

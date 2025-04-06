const express = require('express');
const router = express.Router();
const { getQuizQuestions, submitQuiz } = require('../controllers/questionsController');

router.get('/:id', getQuizQuestions);
router.post('/submit', submitQuiz);

module.exports = router;

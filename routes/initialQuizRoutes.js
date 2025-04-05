const express = require('express');
const router = express.Router();
const initialQuizController = require('../controllers/initialQuizController');

router.post('/', initialQuizController.createQuestion);
router.get('/', initialQuizController.getAllQuestions);
router.get('/:id', initialQuizController.getQuestionById);
router.put('/:id', initialQuizController.updateQuestion);
router.delete('/:id', initialQuizController.deleteQuestion);

module.exports = router;

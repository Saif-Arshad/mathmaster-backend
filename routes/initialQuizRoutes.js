const express = require('express');
const router = express.Router();
const initialQuizController = require('../controllers/initialQuizController');

// Create a new question
router.post('/', initialQuizController.createQuestion);

// Get all questions
router.get('/', initialQuizController.getAllQuestions);

// Get a question by ID
router.get('/:id', initialQuizController.getQuestionById);

// Update a question
router.put('/:id', initialQuizController.updateQuestion);

// Delete a question
router.delete('/:id', initialQuizController.deleteQuestion);

module.exports = router;

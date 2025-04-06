const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionsController')
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/verifyToken');


router.get('/users', adminController.getAllUsers);
router.patch('/block-user/:user_id', adminController.blockUser);
router.patch('/unblock-user/:user_id', adminController.unblockUser);
router.post('/levels', adminController.addLevel);
router.get('/levels', adminController.getAllLevels);
router.get('/levels-sublevels',verifyToken, adminController.getAllLevels2);
router.put('/levels/:level_id', adminController.modifyLevel);
router.delete('/levels/:level_id', adminController.deleteLevel);
router.post('/sub-levels', adminController.addSubLevel);
router.put('/sub-levels/:sublevel_id', adminController.modifySubLevel);
router.delete('/sub-levels/:sublevel_id', adminController.deleteSubLevel);
router.get('/questions/levels', questionController.getLevelsWithSublevels);
router.post('/questions/submit', questionController.submitSubLevel);
router.get('/questions', questionController.GetAllQuestions);
router.get('/questions/:id', questionController.getUserQuestions);
router.post('/questions', questionController.addQuestion);
router.put('/questions/:question_id', questionController.modifyQuestion);
router.delete('/questions/:question_id', questionController.deleteQuestion);
router.post('/login', adminController.loginAdmin);
router.post('/send-email', adminController.sendEmailToUser);

module.exports = router;

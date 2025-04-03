// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyAdmin = require('../middleware/verifyAdmin'); // see below if you want admin verification

router.get('/users', adminController.getAllUsers);
router.patch('/block-user/:user_id', adminController.blockUser);
router.patch('/unblock-user/:user_id', adminController.unblockUser);

router.patch('/levels/passing-percentage/:level_id', verifyAdmin, adminController.setMinQuizPercentage);
router.post('/levels', adminController.addLevel);
router.get('/levels', adminController.getAllLevels);
router.put('/levels/:level_id', adminController.modifyLevel);
router.delete('/levels/:level_id', adminController.deleteLevel);
router.post('/sub-levels', adminController.addSubLevel);
router.put('/sub-levels/:sublevel_id', adminController.modifySubLevel);
router.delete('/sub-levels/:sublevel_id', adminController.deleteSubLevel);

router.post('/questions', verifyAdmin, adminController.addQuestion);
router.delete('/questions/:question_id', verifyAdmin, adminController.deleteQuestion);
router.put('/questions/:question_id', verifyAdmin, adminController.modifyQuestion);

router.post('/regrade/:performance_id', verifyAdmin, adminController.regradeQuiz);
router.post('/login', adminController.loginAdmin);
router.get('/report', verifyAdmin, adminController.generateReport);
router.post('/send-email', adminController.sendEmailToUser);

module.exports = router;

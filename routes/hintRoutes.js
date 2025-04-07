const express = require('express');
const router = express.Router();
const hintController = require('../controllers/hintController');

router.post('/', hintController.createHint);
router.get('/', hintController.getHints);
router.get('/:id', hintController.getHintById);
router.put('/:id', hintController.updateHint);
router.delete('/:id', hintController.deleteHint);

module.exports = router;
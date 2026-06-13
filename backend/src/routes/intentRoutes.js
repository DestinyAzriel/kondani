const express = require('express');
const router = express.Router();
const intentController = require('../controllers/intentController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, intentController.getIntents);
router.post('/:id/like', authMiddleware, intentController.likeIntent);
router.post('/:id/pass', authMiddleware, intentController.passIntent);

module.exports = router;

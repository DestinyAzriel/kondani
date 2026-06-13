const express = require('express');
const router = express.Router();
const likesController = require('../controllers/likesController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, likesController.getLikes);

module.exports = router;

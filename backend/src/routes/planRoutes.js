const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, planController.getPlans);
router.post('/', authMiddleware, planController.createPlan);
router.post('/:id/join', authMiddleware, planController.joinPlan);
router.delete('/:id', authMiddleware, planController.deletePlan);

module.exports = router;

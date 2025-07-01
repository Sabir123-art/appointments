const express = require('express');
const router = express.Router();
const counselorController = require('../controllers/counselorController');
const { checkAuthenticated, checkCounselor } = require('../middleware/authMiddleware');

// GET: Counselor dashboard
router.get('/dashboard', checkAuthenticated, checkCounselor, counselorController.getDashboard);

// GET: List all counselors (visible to authenticated users)
router.get('/', checkAuthenticated, counselorController.getCounselors);

// GET: Edit counselor profile form
router.get('/edit', checkAuthenticated, checkCounselor, counselorController.getEditForm);

// POST: Update counselor profile
router.post('/edit', checkAuthenticated, checkCounselor, counselorController.updateCounselor);

module.exports = router;

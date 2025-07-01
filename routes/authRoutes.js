const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { checkNotAuthenticated } = require('../middleware/authMiddleware');

// GET: Login page
router.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('auth/login');
});

// POST: Login handler
router.post('/login', checkNotAuthenticated, authController.login);

// GET: Student registration page
router.get('/register/student', checkNotAuthenticated, (req, res) => {
  res.render('auth/register', { role: 'student' });
});

// POST: Student registration handler
router.post('/register/student', checkNotAuthenticated, authController.registerStudent);

// GET: Counselor registration page
router.get('/register/counselor', checkNotAuthenticated, (req, res) => {
  res.render('auth/register', { role: 'counselor' });
});

// POST: Counselor registration handler
router.post('/register/counselor', checkNotAuthenticated, authController.registerCounselor);

// GET: Logout route with callback to handle errors (Express 5+)
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth/login');
  });
});

module.exports = router;

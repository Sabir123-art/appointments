const express = require('express');
const router = express.Router();
const { checkAuthenticated } = require('../middleware/authMiddleware');

router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.role === 'student') {
      return res.redirect('/appointments');
    } else if (req.user.role === 'counselor') {
      return res.redirect('/counselors/dashboard');
    }
  }
  res.render('index', { title: 'Welcome' });
});


module.exports = router;

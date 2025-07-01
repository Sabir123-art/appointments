const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const Student = require('../models/Student');
const Counselor = require('../models/Counselor');

// Register Student
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, studentId, department, year } = req.body;

    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match');
      return res.redirect('/auth/register/student');
    }

    let user = await User.findOne({ email });
    if (user) {
      req.flash('error_msg', 'Email already registered');
      return res.redirect('/auth/register/student');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'student'
    });

    await user.save();

    const student = new Student({
      user: user._id,
      studentId,
      department,
      year
    });

    await student.save();

    user.student = student._id;
    await user.save();

    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server error');
    res.redirect('/auth/register/student');
  }
};

// Register Counselor
exports.registerCounselor = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, specialization, bio, availableDays, availableHours } = req.body;

    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match');
      return res.redirect('/auth/register/counselor');
    }

    let user = await User.findOne({ email });
    if (user) {
      req.flash('error_msg', 'Email already registered');
      return res.redirect('/auth/register/counselor');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'counselor'
    });

    await user.save();

    const counselor = new Counselor({
      user: user._id,
      specialization,
      bio,
      availableDays: availableDays.split(','),
      availableHours: availableHours.split(',')
    });

    await counselor.save();

    user.counselor = counselor._id;
    await user.save();

    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server error');
    res.redirect('/auth/register/counselor');
  }
};

// Login
exports.login = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req, res, next);
};

// Logout
exports.logout = (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/auth/login');
};
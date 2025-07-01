const Counselor = require('../models/Counselor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Counselor Dashboard
exports.getDashboard = async (req, res) => {
  try {
    if (!req.user?.counselor) {
      req.flash('error_msg', 'Unauthorized access');
      return res.redirect('/');
    }

    const counselor = await Counselor.findById(req.user.counselor._id);
    const appointments = await Appointment.find({ counselor_id: counselor._id })
      .populate('student_id')
      .sort({ date: 1 });

    res.render('counselors/dashboard', {
      counselor,
      appointments,
      title: 'Counselor Dashboard'
    });
  } catch (err) {
    console.error('Error loading dashboard:', err);
    req.flash('error_msg', 'Server error');
    res.redirect('/');
  }
};

// Get All Counselors
exports.getCounselors = async (req, res) => {
  try {
    const counselors = await Counselor.find().populate('user');
    res.render('counselors/index', {
      counselors,
      title: 'All Counselors'
    });
  } catch (err) {
    console.error('Error fetching counselors:', err);
    req.flash('error_msg', 'Server error');
    res.redirect('/');
  }
};

// Render Edit Form
exports.getEditForm = async (req, res) => {
  try {
    if (!req.user?.counselor) {
      req.flash('error_msg', 'Unauthorized access');
      return res.redirect('/');
    }

    const counselor = await Counselor.findById(req.user.counselor._id).populate('user');
    res.render('counselors/edit', {
      counselor,
      title: 'Edit Profile'
    });
  } catch (err) {
    console.error('Error rendering edit form:', err);
    req.flash('error_msg', 'Server error');
    res.redirect('/counselors/dashboard');
  }
};

// Update Profile
exports.updateCounselor = async (req, res) => {
  try {
    if (!req.user?.counselor) {
      req.flash('error_msg', 'Unauthorized access');
      return res.redirect('/');
    }

    const { name, specialization, bio, availableDays, availableHours } = req.body;

    await User.findByIdAndUpdate(req.user._id, { name });
    await Counselor.findByIdAndUpdate(req.user.counselor._id, {
      specialization,
      bio,
      availableDays: availableDays.split(',').map(d => d.trim()),
      availableHours: availableHours.split(',').map(h => h.trim())
    });

    req.flash('success_msg', 'Profile updated successfully');
    res.redirect('/counselors/dashboard');
  } catch (err) {
    console.error('Error updating profile:', err);
    req.flash('error_msg', 'Error updating profile');
    res.redirect('/counselors/edit');
  }
};

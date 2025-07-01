
const express = require('express');
const router = express.Router();
const Counselor = require('../models/Counselor'); // Add this import
const appointmentController = require('../controllers/appointmentController');
const { checkAuthenticated, checkStudent } = require('../middleware/authMiddleware');
const Appointment = require('../models/Appointment');

// Book appointment
router.get('/book', checkAuthenticated, checkStudent, async (req, res) => {
  try {
    const counselors = await Counselor.find().populate('user');
    res.render('appointments/book', { 
      counselors,
      title: 'Book Appointment' 
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading counselors');
    res.redirect('/appointments');
  }
});

router.post('/book', checkAuthenticated, checkStudent, appointmentController.bookAppointment);
router.get('/book', appointmentController.renderBookForm);

// View appointments
router.get('/', checkAuthenticated, appointmentController.getStudentAppointments);

router.post('/:id/confirm', async (req, res) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.id, { status: 'confirmed' });
    req.flash('success_msg', 'Appointment confirmed.');
    res.redirect('/counselors/dashboard'); // Or wherever your dashboard is
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to confirm appointment.');
    res.redirect('/counselors/dashboard');
  }
});

// Cancel appointment
router.post('/:id/cancel', async (req, res) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    req.flash('success_msg', 'Appointment cancelled.');
    res.redirect('/counselors/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to cancel appointment.');
    res.redirect('/counselors/dashboard');
  }
});

// Multi-counselor report (for counselors)
router.get('/report', checkAuthenticated, appointmentController.getMultiCounselorReport);



module.exports = router;
const Appointment = require('../models/Appointment');
const Student = require('../models/Student');
const Counselor = require('../models/Counselor');

// Book appointment
// exports.bookAppointment = async (req, res) => {
//   try {
//     if (!req.user || !req.user.student) {
//       req.flash('error_msg', 'Only students can book appointments');
//       return res.redirect('/auth/login');
//     }

//     const { counselor_id, date } = req.body;

//     const appointment = new Appointment({
//       student_id: req.user.student._id,
//       counselor_id,
//       date,
//       status: 'pending'
//     });

//     await appointment.save();

//     req.flash('success_msg', 'Appointment booked successfully');
//     res.redirect('/appointments');
//   } catch (err) {
//     console.error('Error booking appointment:', err);
//     req.flash('error_msg', 'Failed to book appointment');
//     res.redirect('/appointments/book');
//   }
// };



exports.bookAppointment = async (req, res) => {
  try {
    // Ensure only logged-in students can book
    if (!req.user || !req.user.student) {
      req.flash('error_msg', 'Only students can book appointments');
      return res.redirect('/auth/login');
    }

    const { counselor_id, date } = req.body;

    // Validate required fields
    if (!counselor_id || !date) {
      req.flash('error_msg', 'Please fill all fields');
      return res.redirect('/appointments/book');
    }

    // Create and save the appointment
    const appointment = new Appointment({
      student_id: req.user.student._id,
      counselor_id,
      date,
      status: 'pending',
    });

    await appointment.save();

    req.flash('success_msg', 'Appointment booked successfully!');
    return res.redirect('/appointments');
  } catch (err) {
    console.error('Error booking appointment:', err);
    req.flash('error_msg', 'Failed to book appointment');
    return res.redirect('/appointments/book');
  }
};


// Get all appointments for a student
exports.getStudentAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ student_id: req.user.student._id })
      .populate('counselor_id')
      .sort({ date: 1 });

    res.render('appointments/index', {
      appointments,
      title: 'My Appointments'
    });
  } catch (err) {
    console.error('Error fetching student appointments:', err);
    req.flash('error_msg', 'Error fetching appointments');
    res.redirect('/');
  }
};

// Report: students who booked with multiple counselors in the same month
exports.getMultiCounselorReport = async (req, res) => {
  try {
    if (!req.user || !req.user.counselor) {
      req.flash('error_msg', 'Unauthorized access');
      return res.redirect('/');
    }

    const report = await Appointment.aggregate([
      {
        $project: {
          student_id: 1,
          counselor_id: 1,
          month: { $month: '$date' },
          year: { $year: '$date' }
        }
      },
      {
        $group: {
          _id: {
            student_id: '$student_id',
            month: '$month',
            year: '$year'
          },
          unique_counselors: { $addToSet: '$counselor_id' },
          appointment_count: { $sum: 1 }
        }
      },
      {
        $project: {
          student_id: '$_id.student_id',
          month: '$_id.month',
          year: '$_id.year',
          counselor_count: { $size: '$unique_counselors' },
          appointment_count: 1
        }
      },
      { $match: { counselor_count: { $gt: 1 } } },
      { $sort: { year: 1, month: 1, student_id: 1 } },
      {
        $lookup: {
          from: 'students',
          localField: 'student_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'users',
          localField: 'student.user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ]);

    res.render('appointments/report', {
      reports: report,
      title: 'Multi-Counselor Appointment Report',
      monthNames: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
    });
  } catch (err) {
    console.error('Error generating report:', err);
    req.flash('error_msg', 'Error generating report');
    res.redirect('/counselors/dashboard');
  }
};

// Render appointment booking form
exports.renderBookForm = async (req, res) => {
  try {
    const counselors = await Counselor.find().populate('user');
    res.render('appointments/book', {
      counselors,
      selectedCounselor: req.query.counselor || '',
      title: 'Book Appointment'
    });
  } catch (err) {
    console.error('Error rendering book form:', err);
    req.flash('error_msg', 'Unable to load booking form');
    res.redirect('/appointments');
  }
};

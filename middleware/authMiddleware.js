// Ensure user is authenticated
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Please log in to view that resource');
  res.redirect('/auth/login');
}

// Ensure user is not authenticated
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

// Ensure user is a student
function checkStudent(req, res, next) {
  if (req.user && req.user.student) {
    return next();
  }
  req.flash('error_msg', 'Unauthorized access - Students only');
  res.redirect('/');
}

// Ensure user is a counselor
function checkCounselor(req, res, next) {
  if (req.user && req.user.counselor) {
    return next();
  }
  req.flash('error_msg', 'Unauthorized access - Counselors only');
  res.redirect('/');
}

module.exports = {
  checkAuthenticated,
  checkNotAuthenticated,
  checkStudent,
  checkCounselor
};

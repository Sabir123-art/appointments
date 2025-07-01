process.removeAllListeners('warning');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

const app = express();

// Database connection
const connectDB = require('./cofig/db'); // Fixed path from './cofig/db'
connectDB();

// Passport config
require('./cofig/passport')(passport); // Fixed path from './cofig/passport'

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Express session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, // Changed to false for better performance
  saveUninitialized: false, // Changed to false for GDPR compliance
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    secure: process.env.NODE_ENV === 'production' // Secure in production
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
  app.use((req, res, next) => {
  // Only transfer flash messages to locals if they exist
  res.locals.success_msg = req.flash('success_msg').length ? req.flash('success_msg') : null;
  res.locals.error_msg = req.flash('error_msg').length ? req.flash('error_msg') : null;
  res.locals.error = req.flash('error').length ? req.flash('error') : null;
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  res.locals.title = 'Appointment Booking System';
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/appointments', require('./routes/appointmentRoutes'));
app.use('/counselors', require('./routes/counselorRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: err });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Set default status code
  res.status(err.status || 500);
  
  // Set error title
  const title = err.status === 404 ? 'Page Not Found' : 'Error Occurred';
  
  res.render('error', { 
    title: title,
    error: process.env.NODE_ENV === 'development' ? err : { message: err.message }
  });
});

// 404 handler (keep this after all other routes)
app.use((req, res, next) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    error: { message: 'The page you requested could not be found' }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
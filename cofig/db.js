const mongoose = require('mongoose');
const chalk = require('chalk');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {

    });

    console.log(chalk.cyan.underline(`MongoDB Connected: ${conn.connection.host}`));
  } catch (err) {
    console.error(chalk.red.bold(`Error: ${err.message}`));
    process.exit(1);
  }
};

// MongoDB connection events
mongoose.connection.on('connected', () => {
  // console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.log(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;
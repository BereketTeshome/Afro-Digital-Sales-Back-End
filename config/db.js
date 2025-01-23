const mongoose = require('mongoose');
const mysql = require('mysql2');
const { Client } = require('pg'); // PostgreSQL client for Supabase
const firebaseAdmin = require('firebase-admin');
const config = require('./config');

const connectDB = async (app) => {
  const dbType = config.DB_TYPE || 'mongodb'; // Default to Firebase if no DB_TYPE is provided

  try {
    // Set the dbType in app.locals for later use
    app.locals.dbType = dbType; // Storing dbType in app.locals

    switch (dbType) {
      case 'mongodb':
        const mongoConnection = await mongoose.connect(config.MONGO_URI);
        console.log('MongoDB connected successfully');
        app.locals.db = mongoConnection.connection.db; // Store MongoDB instance
        break;

      case 'mysql':
        const mysqlConnection = mysql.createConnection({
          host: config.MYSQL_HOST,
          user: config.MYSQL_USER,
          password: config.MYSQL_PASSWORD,
          database: config.MYSQL_DB,
        });
        mysqlConnection.connect((err) => {
          if (err) throw err;
          console.log('MySQL connected successfully');
        });
        app.locals.db = mysqlConnection; // Store MySQL connection
        break;

      case 'supabase':
        const supabaseClient = new Client({
          user: config.SUPABASE_USER,
          host: config.SUPABASE_HOST,
          database: config.SUPABASE_DB,
          password: config.SUPABASE_PASSWORD,
          port: 5432,
        });
        await supabaseClient.connect();
        console.log('Supabase connected successfully');
        app.locals.db = supabaseClient; // Store PostgreSQL client
        break;

      case 'firebase':
        const serviceAccount = require('../config/serviceAccount.json'); // Adjust the path if needed
        firebaseAdmin.initializeApp({
          credential: firebaseAdmin.credential.cert(serviceAccount),
          databaseURL: config.FIREBASE_DB_URL,
        });
        console.log('Firebase connected successfully');
        app.locals.db = firebaseAdmin.firestore(); // Use Firestore for Firebase
        break;

      default:
        throw new Error('Unsupported database type');
    }
  } catch (error) {
    console.error('Database connection failed', error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;

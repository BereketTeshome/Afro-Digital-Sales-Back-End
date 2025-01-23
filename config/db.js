const mongoose = require('mongoose');
const mysql = require('mysql2');
const { Client } = require('pg');  // PostgreSQL client for Supabase
const firebaseAdmin = require('firebase-admin');
const config = require('./config');

const connectDB = async () => {
  const dbType = config.DB_TYPE || 'mongodb';  // Default to MongoDB if no DB_TYPE is provided

  try {
    switch (dbType) {
      case 'mongodb':
        // MongoDB connection using Mongoose
        await mongoose.connect(config.MONGO_URI);
        console.log('MongoDB connected successfully');
        break;

      case 'mysql':
        // MySQL connection using mysql2
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
        break;

      case 'supabase':
        // Supabase connection using PostgreSQL client (assuming Supabase uses PostgreSQL)
        const supabaseClient = new Client({
          user: config.SUPABASE_USER,
          host: config.SUPABASE_HOST,
          database: config.SUPABASE_DB,
          password: config.SUPABASE_PASSWORD,
          port: 5432,  // Default PostgreSQL port
        });
        await supabaseClient.connect();
        console.log('Supabase connected successfully');
        break;

      case 'firebase':
        // Firebase Admin SDK initialization
        firebaseAdmin.initializeApp({
          credential: firebaseAdmin.credential.cert(config.FIREBASE_CREDENTIAL),
          databaseURL: config.FIREBASE_DB_URL,
        });
        console.log('Firebase connected successfully');
        break;

      default:
        throw new Error('Unsupported database type');
    }
  } catch (error) {
    console.error('Database connection failed', error);
    process.exit(1);  // Exit process with failure
  }
};

module.exports = connectDB;

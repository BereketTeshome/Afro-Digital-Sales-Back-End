const { MongoClient } = require('mongodb');
const { Pool } = require('pg');
const firebaseAdmin = require('firebase-admin');

// Firebase initialization
const firebaseConfig = require('./firebase');
firebaseAdmin.initializeApp(firebaseConfig);

// MongoDB configuration
const mongoURI = process.env.MONGO_URI;
const mongoClient = new MongoClient(mongoURI);

// PostgreSQL configuration
const pgPool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

async function connectToDatabase() {
  try {
    await mongoClient.connect();
    console.log('Connected to MongoDB');
     return mongoClient.db();
  } catch (firebaseError) {
    console.error('Firebase connection failed:', firebaseError.message);
    try {
        await firebaseAdmin.auth().listUsers(); // Simple Firebase check
        console.log('Connected to Firebase');
        return firebaseAdmin;
    } catch (mongoError) {
      console.error('MongoDB connection failed:', mongoError.message);
      try {
        await pgPool.connect();
        console.log('Connected to PostgreSQL');
        return pgPool;
      } catch (pgError) {
        console.error('PostgreSQL connection failed:', pgError.message);
        throw new Error('All database connections failed');
      }
    }
  }
}

module.exports = connectToDatabase;

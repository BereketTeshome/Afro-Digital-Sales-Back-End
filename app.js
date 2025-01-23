const express = require('express');
const connectDB = require('./config/db');
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.json()); // To parse JSON request bodies

// Connect to database (pass `app` instance)
connectDB(app);

// Routes
app.use('/api/auth', authRoutes);

// Start server
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

module.exports = app;

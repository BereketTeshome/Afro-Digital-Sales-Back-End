const express = require('express');
const connectDB = require('./config/db');
const errorMiddleware = require('./middlewares/errorMiddleware');
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());  // To parse JSON request bodies
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use(errorMiddleware);

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});


module.exports = app;

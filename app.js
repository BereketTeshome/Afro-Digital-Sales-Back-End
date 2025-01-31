
const express = require('express');
const connectDB = require('./config/db');
const config = require('./config/config');
const vendorRoutes = require('./routes/vendorRoutes');
const salesRoutes = require('./routes/salesRoutes');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cors = require("cors");

const rateLimit = require('express-rate-limit'); 


const app = express();

// Middleware
app.use(express.json()); // To parse JSON request bodies

// Connect to database (pass `app` instance)
connectDB(app);

app.use(cors())


const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100, 
  message: 'Too many requests, please try again later.'
});


const vendorLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 3, 
  message: 'Too many vendor requests, please try again later.'
});


const productLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 50, 
  message: 'Too many product requests, please try again later.'
});


app.use('/api/', apiLimiter); 

app.use('/api/auth/vendor', vendorLimiter, vendorRoutes); 
app.use('/api/product', productLimiter, productRoutes); // Apply product rate limiter

// Routes
// app.use('/api/auth/vendor', vendorRoutes);
app.use('/api/auth/sales', salesRoutes);
app.use('/api/auth/customer', customerRoutes);
// app.use('/api/product', productRoutes);
app.use('/api/order', orderRoutes);


// Start server
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

module.exports = app;

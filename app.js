
const express = require('express');
const connectDB = require('./config/db');
const config = require('./config/config');
const vendorRoutes = require('./routes/vendorRoutes');
const salesRoutes = require('./routes/salesRoutes');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cors = require("cors");

const rateLimit = require('express-rate-limit'); // Import express-rate-limit

// const { fetchDataFromMongoDB, addDataToMongoDB } = require('./services/mongoService'); // Import MongoDB service

const app = express();

// Middleware
app.use(express.json()); // To parse JSON request bodies

// Connect to database (pass `app` instance)
connectDB(app);

app.use(cors())
// Rate Limiter Configuration for API routes
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 100, // Limit each IP to 100 requests per minute
  message: 'Too many requests, please try again later.'
});

// Rate Limiter for sensitive routes (example: vendor routes)
const vendorLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 3, // Limit to 3 requests per minute for vendor routes
  message: 'Too many vendor requests, please try again later.'
});

// Rate Limiter for product routes (example: product-related actions)
const productLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 50, // Limit to 50 requests per minute for product-related routes
  message: 'Too many product requests, please try again later.'
});

// Apply the rate limiters to specific routes
app.use('/api/', apiLimiter); // Apply to all API routes by default
// Apply specific rate limiters to certain routes
app.use('/api/auth/vendor', vendorLimiter, vendorRoutes); // Apply vendor rate limiter
app.use('/api/product', productLimiter, productRoutes); // Apply product rate limiter

// Routes
// app.use('/api/auth/vendor', vendorRoutes);
app.use('/api/auth/sales', salesRoutes);
app.use('/api/auth/customer', customerRoutes);
// app.use('/api/product', productRoutes);
app.use('/api/order', orderRoutes);

// app.get("/api/data", async (req, res) => {
//   const data = await fetchDataFromMongoDB();
//   res.json(data);
// });

// app.post("/api/data", async (req, res) => {
//   const newData = await addDataToMongoDB(req.body);
//   res.json(newData);
// })

// Start server
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

module.exports = app;

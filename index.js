require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const app = express();
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const cors = require('cors');

// Middleware
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get("/", (req, res) => {
    res.send("Hello world");
});

// Routes
app.use('/user', userRouter);
app.use('/product', productRouter);

const start = async () => {
    const port = process.env.PORT || 3001;
    try {
        const db = await connectDB();  // No need to pass MONGO_URL, since the connectDB function handles dynamic DB connections
        app.locals.db = db;  // Attach the DB connection to app.locals for access in other parts of the app
        app.listen(port, () => console.log(`Server is running on port ${port}`));
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);  // Exit the process with an error code if the server fails to start
    }
};

start();

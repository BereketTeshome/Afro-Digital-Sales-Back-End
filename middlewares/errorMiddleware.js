// Error handling middleware
function errorMiddleware(err, req, res, next) {
    console.error(err.stack); // Logs the error stack trace
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
  }
  
async function checkAuth(req, res, next) {
    try {
        const db = req.app.locals.db;
        const token = req.headers.authorization;

        let user;
        if (db.collection) {
            // MongoDB logic to validate token
            user = await db.collection('users').findOne({ token });
        } else if (db.query) {
            // PostgreSQL logic to validate token
            const result = await db.query('SELECT * FROM users WHERE token = $1', [token]);
            user = result.rows[0];
        } else {
            // Firebase logic to validate token
            user = await db.auth().verifyIdToken(token);
        }

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
}

module.exports = checkAuth;

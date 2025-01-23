async function getUsers(req, res) {
    try {
        const db = req.app.locals.db;
        let users;

        if (db.collection) {
            users = await db.collection('users').find().toArray();  // MongoDB
        } else if (db.query) {
            const result = await db.query('SELECT * FROM users');  // PostgreSQL
            users = result.rows;
        } else {
            const snapshot = await db.firestore().collection('users').get();  // Firebase
            users = snapshot.docs.map(doc => doc.data());
        }

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
}

async function createUser(req, res) {
    try {
        const db = req.app.locals.db;
        console.log("db", db)
        const newUser = req.body;

        if (db.collection) {
            console.log("testttt")
            await db.collection('users').insertOne(newUser);  // MongoDB
        } else if (db.query) {
            await db.query('INSERT INTO users (name, email) VALUES ($1, $2)', [newUser.name, newUser.email]);  // PostgreSQL
            console.log("testttt postgrs")

        } else {
            await db.firestore().collection('users').add(newUser);  // Firebase
            console.log("testttt fire")

        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
}

async function getUserById(req, res) {
    try {
        const db = req.app.locals.db;
        const userId = req.params.id;
        let user;

        if (db.collection) {
            user = await db.collection('users').findOne({ _id: new db.ObjectId(userId) });  // MongoDB
        } else if (db.query) {
            const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);  // PostgreSQL
            user = result.rows[0];
        } else {
            const doc = await db.firestore().collection('users').doc(userId).get();  // Firebase
            user = doc.data();
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
}

async function updateUser(req, res) {
    try {
        const db = req.app.locals.db;
        const userId = req.params.id;
        const updatedData = req.body;

        if (db.collection) {
            await db.collection('users').updateOne({ _id: new db.ObjectId(userId) }, { $set: updatedData });  // MongoDB
        } else if (db.query) {
            await db.query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [updatedData.name, updatedData.email, userId]);  // PostgreSQL
        } else {
            await db.firestore().collection('users').doc(userId).update(updatedData);  // Firebase
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
}

async function deleteUser(req, res) {
    try {
        const db = req.app.locals.db;
        const userId = req.params.id;

        if (db.collection) {
            await db.collection('users').deleteOne({ _id: new db.ObjectId(userId) });  // MongoDB
        } else if (db.query) {
            await db.query('DELETE FROM users WHERE id = $1', [userId]);  // PostgreSQL
        } else {
            await db.firestore().collection('users').doc(userId).delete();  // Firebase
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
}

module.exports = {
    getUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
};

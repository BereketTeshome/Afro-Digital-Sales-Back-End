
async function getUsers(req, res) {
    try {
        const db = req.app.locals.db;
        let users;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        console.log("DB TYPE", dbType)

        if (dbType === 'mongodb') {
            // MongoDB logic
            users = await db.collection('users').find().toArray();
        } 
        else if (dbType === 'mysql') {
            // MySQL logic
            const result = await db.query('SELECT * FROM users');
            users = result.rows;
        } 
        else if (dbType === 'supabase') {
            // Supabase logic (PostgreSQL)
            const result = await db.query('SELECT * FROM users');
            users = result.rows;
        }
        else if (dbType === 'firebase') {
            const snapshot = await db.collection('users').get();
            users = snapshot.docs.map(doc => doc.data());
        }
        else {
            throw new Error('Unsupported database type');
        }

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
}


const createUser = async (req, res) => {
    const db = req.app.locals.db; // Get database instance
    const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
  
    try {
      if (dbType === 'firebase') {
        // Firebase-specific logic (using Firestore)
        const userRef = db.collection('users').doc(); // Firestore example
        await userRef.set(req.body); // Set user data
        res.status(200).json({ message: 'User created successfully' });
      } else if (dbType === 'mongodb') {
        // MongoDB logic
        // Insert into MongoDB collection, for example
        const newUser = new User(req.body);
        await newUser.save();
        res.status(200).json({ message: 'User created successfully' });
      } else if (dbType === 'mysql') {
        // MySQL logic
        const [rows] = await db.promise().query('INSERT INTO users SET ?', req.body);
        res.status(200).json({ message: 'User created successfully' });
      } else if (dbType === 'supabase') {
        // Supabase logic (PostgreSQL)
        const { data, error } = await db
          .from('users')
          .insert([req.body]);
  
        if (error) throw new Error(error.message);
  
        res.status(200).json({ message: 'User created successfully', data });
      } else {
        throw new Error('Unsupported database type');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Error creating user', error: error.message });
    }
  };
  




async function getUserById(req, res) {
    try {
        const db = req.app.locals.db;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        const userId = req.params.id;
        let user;

        // MongoDB logic
        if (dbType === 'mongodb') {
            user = await db.collection('users').findOne({ _id: new db.ObjectId(userId) });
        } 
        // PostgreSQL logic
        else if (dbType === 'mysql' || dbType === 'supabase') {
            const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
            user = result.rows[0];
        } 
        // Firebase Firestore logic
        else if (dbType === 'firebase') {
            const doc = await db.collection('users').doc(userId).get();
            if (doc.exists) {
                user = doc.data();
            }
        }

        // If user not found, return 404
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the user data
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
}


async function updateUser(req, res) {
    try {
        const db = req.app.locals.db;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        const userId = req.params.id;
        const updatedData = req.body;

        // MongoDB logic
        if (dbType === 'mongodb') {
            await db.collection('users').updateOne({ _id: new db.ObjectId(userId) }, { $set: updatedData });
        } 
        // PostgreSQL logic (Supabase uses PostgreSQL)
        else if (dbType === 'mysql' || dbType === 'supabase') {
            await db.query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [updatedData.name, updatedData.email, userId]);
        } 
        // Firebase Firestore logic
        else if (dbType === 'firebase') {
            await db.collection('users').doc(userId).update(updatedData);
        } else {
            throw new Error('Unsupported database type');
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
}



async function deleteUser(req, res) {
    try {
        const db = req.app.locals.db;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        const userId = req.params.id;

        // MongoDB delete logic
        if (dbType === 'mongodb') {
            await db.collection('users').deleteOne({ _id: new db.ObjectId(userId) });
        } 
        // PostgreSQL (Supabase uses PostgreSQL) delete logic
        else if (dbType === 'mysql' || dbType === 'supabase') {
            await db.query('DELETE FROM users WHERE id = $1', [userId]);
        } 
        // Firebase Firestore delete logic
        else if (dbType === 'firebase') {
            await db.collection('users').doc(userId).delete();
        } else {
            throw new Error('Unsupported database type');
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
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

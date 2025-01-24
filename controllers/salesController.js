const Sales = require('../models/salesModel');




async function getSales(req, res) {
    try {
        const db = req.app.locals.db;
        let sales;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        console.log("DB TYPE", dbType)

        if (dbType === 'mongodb') {
            // MongoDB logic
            sales = await db.collection('sales').find().toArray();
        } 
        else if (dbType === 'mysql') {
            // MySQL logic
            const result = await db.query('SELECT * FROM sales');
            sales = result.rows;
        } 
        else if (dbType === 'supabase') {
            // Supabase logic (PostgreSQL)
            const result = await db.query('SELECT * FROM sales');
            sales = result.rows;
        }
        else if (dbType === 'firebase') {
            const snapshot = await db.collection('sales').get();
            sales = snapshot.docs.map(doc => doc.data());
        }
        else {
            throw new Error('Unsupported database type');
        }

        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales', error: error.message });
    }
}


const createSales = async (req, res) => {
    const db = req.app.locals.db; // Get database instance
    const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
    console.log("DB TYPE", dbType)

    try {
      if (dbType === 'firebase') {
        // Firebase-specific logic (using Firestore)
        const salesRef = db.collection('sales').doc(); // Firestore example
        await salesRef.set(req.body); // Set sales data
        res.status(200).json({ message: 'Sales created successfully' });
      } else if (dbType === 'mongodb') {
        // MongoDB logic
        // Insert into MongoDB collection, for example
        const newSales = new Sales(req.body);
        await newSales.save();
        res.status(200).json({ message: 'Sales created successfully' });
      } else if (dbType === 'mysql') {
        // MySQL logic
        const [rows] = await db.promise().query('INSERT INTO sales SET ?', req.body);
        res.status(200).json({ message: 'Sales created successfully' });
      } else if (dbType === 'supabase') {
        // Supabase logic (PostgreSQL)
        const { data, error } = await db
          .from('sales')
          .insert([req.body]);
  
        if (error) throw new Error(error.message);
  
        res.status(200).json({ message: 'Sales created successfully', data });
      } else {
        throw new Error('Unsupported database type');
      }
    } catch (error) {
      console.error('Error creating sales:', error);
      res.status(500).json({ message: 'Error creating sales', error: error.message });
    }
  };
  




async function getSalesById(req, res) {
    try {
        const db = req.app.locals.db;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        const salesId = req.params.id;
        let sales;

        // MongoDB logic
        if (dbType === 'mongodb') {
            sales = await db.collection('sales').findOne({ _id: new db.ObjectId(salesId) });
        } 
        // PostgreSQL logic
        else if (dbType === 'mysql' || dbType === 'supabase') {
            const result = await db.query('SELECT * FROM sales WHERE id = $1', [salesId]);
            sales = result.rows[0];
        } 
        // Firebase Firestore logic
        else if (dbType === 'firebase') {
            const doc = await db.collection('sales').doc(salesId).get();
            if (doc.exists) {
                sales = doc.data();
            }
        }

        // If sales not found, return 404
        if (!sales) {
            return res.status(404).json({ message: 'Sales not found' });
        }

        // Return the sales data
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales', error: error.message });
    }
}


async function updateSales(req, res) {
    try {
        const db = req.app.locals.db;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        const salesId = req.params.id;
        const updatedData = req.body;

        // MongoDB logic
        if (dbType === 'mongodb') {
            await db.collection('sales').updateOne({ _id: new db.ObjectId(salesId) }, { $set: updatedData });
        } 
        // PostgreSQL logic (Supabase uses PostgreSQL)
        else if (dbType === 'mysql' || dbType === 'supabase') {
            await db.query('UPDATE sales SET name = $1, email = $2 WHERE id = $3', [updatedData.name, updatedData.email, salesId]);
        } 
        // Firebase Firestore logic
        else if (dbType === 'firebase') {
            await db.collection('sales').doc(salesId).update(updatedData);
        } else {
            throw new Error('Unsupported database type');
        }

        res.status(200).json({ message: 'Sales updated successfully' });
    } catch (error) {
        console.error('Error updating sales:', error);
        res.status(500).json({ message: 'Error updating sales', error: error.message });
    }
}



async function deleteSales(req, res) {
    try {
        const db = req.app.locals.db;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        const salesId = req.params.id;

        // MongoDB delete logic
        if (dbType === 'mongodb') {
            await db.collection('sales').deleteOne({ _id: new db.ObjectId(salesId) });
        } 
        // PostgreSQL (Supabase uses PostgreSQL) delete logic
        else if (dbType === 'mysql' || dbType === 'supabase') {
            await db.query('DELETE FROM sales WHERE id = $1', [salesId]);
        } 
        // Firebase Firestore delete logic
        else if (dbType === 'firebase') {
            await db.collection('sales').doc(salesId).delete();
        } else {
            throw new Error('Unsupported database type');
        }

        res.status(200).json({ message: 'Sales deleted successfully' });
    } catch (error) {
        console.error('Error deleting sales:', error);
        res.status(500).json({ message: 'Error deleting sales', error: error.message });
    }
}

module.exports = {
    getSales,
    createSales,
    getSalesById,
    updateSales,
    deleteSales,
};

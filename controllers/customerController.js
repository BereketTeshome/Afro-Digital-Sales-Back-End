const Customer = require('../models/customerModel');

async function getCustomers(req, res) {
    try {
        const db = req.app.locals.db;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10;  // Default to limit 10 if not provided
        const skip = (page - 1) * limit; // Calculate the number of records to skip for pagination
        let customers;

        console.log("DB TYPE", dbType);

        if (dbType === 'mongodb') {
            // MongoDB logic with pagination
            customers = await db.collection('customers')
                                 .find()
                                 .skip(skip)
                                 .limit(limit)
                                 .toArray();
        } 
        else if (dbType === 'mysql') {
            // MySQL logic with pagination
            const result = await db.promise().query('SELECT * FROM customers LIMIT ?, ?', [skip, limit]);
            customers = result[0];  // Rows returned from the query
        } 
        else if (dbType === 'supabase') {
            // Supabase (PostgreSQL) logic with pagination
            const { data, error } = await db.from('customers').select('*').range(skip, skip + limit - 1);
            
            if (error) throw new Error(error.message);

            customers = data;
        }
        else if (dbType === 'firebase') {
            // Firebase logic with pagination (FireStore)
            const snapshot = await db.collection('customers')
                                      .offset(skip)
                                      .limit(limit)
                                      .get();
            customers = snapshot.docs.map(doc => doc.data());
        }
        else {
            throw new Error('Unsupported database type');
        }

        // Get the total number of records for pagination info
        let totalCount;
        if (dbType === 'mongodb') {
            totalCount = await db.collection('customers').countDocuments();
        } else if (dbType === 'mysql' || dbType === 'supabase') {
            const countResult = await db.query('SELECT COUNT(*) as total FROM customers');
            totalCount = countResult[0][0].total;
        } else if (dbType === 'firebase') {
            totalCount = (await db.collection('customers').get()).size;
        }

        res.status(200).json({
            data: customers,
            pagination: {
                page,
                limit,
                totalCount,
            }
        });

    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
}


const createCustomer = async (req, res) => {
    const db = req.app.locals.db; // Get database instance
    const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
    console.log("DB TYPE", dbType)

    try {
      if (dbType === 'firebase') {
        // Firebase-specific logic (using Firestore)
        const customerRef = db.collection('customers').doc(); // Firestore example
        await customerRef.set(req.body); // Set customer data
        res.status(200).json({ message: 'Customer created successfully' });
      } else if (dbType === 'mongodb') {
        // MongoDB logic
        // Insert into MongoDB collection, for example
        const newCustomer = new Customer(req.body);
        await newCustomer.save();
        res.status(200).json({ message: 'Customer created successfully' });
      } else if (dbType === 'mysql') {
        // MySQL logic
        const [rows] = await db.promise().query('INSERT INTO customers SET ?', req.body);
        res.status(200).json({ message: 'Customer created successfully' });
      } else if (dbType === 'supabase') {
        // Supabase logic (PostgreSQL)
        const { data, error } = await db
          .from('customers')
          .insert([req.body]);
  
        if (error) throw new Error(error.message);
  
        res.status(200).json({ message: 'Customer created successfully', data });
      } else {
        throw new Error('Unsupported database type');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({ message: 'Error creating customer', error: error.message });
    }
  };
  




async function getCustomerById(req, res) {
    try {
        const db = req.app.locals.db;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        const customerId = req.params.id;
        let customer;

        // MongoDB logic
        if (dbType === 'mongodb') {
            customer = await db.collection('customers').findOne({ _id: new db.ObjectId(customerId) });
        } 
        // PostgreSQL logic
        else if (dbType === 'mysql' || dbType === 'supabase') {
            const result = await db.query('SELECT * FROM customers WHERE id = $1', [customerId]);
            customer = result.rows[0];
        } 
        // Firebase Firestore logic
        else if (dbType === 'firebase') {
            const doc = await db.collection('customers').doc(customerId).get();
            if (doc.exists) {
                customer = doc.data();
            }
        }

        // If customer not found, return 404
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Return the customer data
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer', error: error.message });
    }
}


async function updateCustomer(req, res) {
    try {
        const db = req.app.locals.db;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        const customerId = req.params.id;
        const updatedData = req.body;

        // MongoDB logic
        if (dbType === 'mongodb') {
            await db.collection('customers').updateOne({ _id: new db.ObjectId(customerId) }, { $set: updatedData });
        } 
        // PostgreSQL logic (Supabase uses PostgreSQL)
        else if (dbType === 'mysql' || dbType === 'supabase') {
            await db.query('UPDATE customers SET name = $1, email = $2 WHERE id = $3', [updatedData.name, updatedData.email, customerId]);
        } 
        // Firebase Firestore logic
        else if (dbType === 'firebase') {
            await db.collection('customers').doc(customerId).update(updatedData);
        } else {
            throw new Error('Unsupported database type');
        }

        res.status(200).json({ message: 'Customer updated successfully' });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ message: 'Error updating customer', error: error.message });
    }
}



async function deleteCustomer(req, res) {
    try {
        const db = req.app.locals.db;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        const customerId = req.params.id;

        // MongoDB delete logic
        if (dbType === 'mongodb') {
            await db.collection('customers').deleteOne({ _id: new db.ObjectId(customerId) });
        } 
        // PostgreSQL (Supabase uses PostgreSQL) delete logic
        else if (dbType === 'mysql' || dbType === 'supabase') {
            await db.query('DELETE FROM customers WHERE id = $1', [customerId]);
        } 
        // Firebase Firestore delete logic
        else if (dbType === 'firebase') {
            await db.collection('customers').doc(customerId).delete();
        } else {
            throw new Error('Unsupported database type');
        }

        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ message: 'Error deleting customer', error: error.message });
    }
}

module.exports = {
    getCustomers,
    createCustomer,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
};

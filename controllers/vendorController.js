const Vendor = require('../models/vendorModel');




async function getVendors(req, res) {
    try {
        const db = req.app.locals.db;
        let vendors;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        console.log("DB TYPE", dbType)

        if (dbType === 'mongodb') {
            // MongoDB logic
            vendors = await db.collection('vendors').find().toArray();
        } 
        else if (dbType === 'mysql') {
            // MySQL logic
            const result = await db.query('SELECT * FROM vendors');
            vendors = result.rows;
        } 
        else if (dbType === 'supabase') {
            // Supabase logic (PostgreSQL)
            const result = await db.query('SELECT * FROM vendors');
            vendors = result.rows;
        }
        else if (dbType === 'firebase') {
            const snapshot = await db.collection('vendors').get();
            vendors = snapshot.docs.map(doc => doc.data());
        }
        else {
            throw new Error('Unsupported database type');
        }

        res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vendors', error: error.message });
    }
}


const createVendor = async (req, res) => {
    const db = req.app.locals.db; // Get database instance
    const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
    console.log("DB TYPE", dbType)

    try {
      if (dbType === 'firebase') {
        // Firebase-specific logic (using Firestore)
        const vendorRef = db.collection('vendors').doc(); // Firestore example
        await vendorRef.set(req.body); // Set vendor data
        res.status(200).json({ message: 'Vendor created successfully' });
      } else if (dbType === 'mongodb') {
        // MongoDB logic
        // Insert into MongoDB collection, for example
        const newVendor = new Vendor(req.body);
        await newVendor.save();
        res.status(200).json({ message: 'Vendor created successfully' });
      } else if (dbType === 'mysql') {
        // MySQL logic
        const [rows] = await db.promise().query('INSERT INTO vendors SET ?', req.body);
        res.status(200).json({ message: 'Vendor created successfully' });
      } else if (dbType === 'supabase') {
        // Supabase logic (PostgreSQL)
        const { data, error } = await db
          .from('vendors')
          .insert([req.body]);
  
        if (error) throw new Error(error.message);
  
        res.status(200).json({ message: 'Sales created successfully', data });
      } else {
        throw new Error('Unsupported database type');
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
      res.status(500).json({ message: 'Error creating vendor', error: error.message });
    }
  };
  




async function getVendorById(req, res) {
    try {
        const db = req.app.locals.db;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        const vendorId = req.params.id;
        let vendor;

        // MongoDB logic
        if (dbType === 'mongodb') {
            vendor = await db.collection('vendors').findOne({ _id: new db.ObjectId(vendorId) });
        } 
        // PostgreSQL logic
        else if (dbType === 'mysql' || dbType === 'supabase') {
            const result = await db.query('SELECT * FROM vendors WHERE id = $1', [vendorId]);
            vendor = result.rows[0];
        } 
        // Firebase Firestore logic
        else if (dbType === 'firebase') {
            const doc = await db.collection('vendors').doc(vendorId).get();
            if (doc.exists) {
                vendor = doc.data();
            }
        }

        // If vendor not found, return 404
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Return the vendor data
        res.status(200).json(vendor);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vendor', error: error.message });
    }
}


async function updateVendor(req, res) {
    try {
        const db = req.app.locals.db;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        const vendorId = req.params.id;
        const updatedData = req.body;

        // MongoDB logic
        if (dbType === 'mongodb') {
            await db.collection('vendors').updateOne({ _id: new db.ObjectId(vendorId) }, { $set: updatedData });
        } 
        // PostgreSQL logic (Supabase uses PostgreSQL)
        else if (dbType === 'mysql' || dbType === 'supabase') {
            await db.query('UPDATE vendors SET name = $1, email = $2 WHERE id = $3', [updatedData.name, updatedData.email, vendorId]);
        } 
        // Firebase Firestore logic
        else if (dbType === 'firebase') {
            await db.collection('vendors').doc(vendorId).update(updatedData);
        } else {
            throw new Error('Unsupported database type');
        }

        res.status(200).json({ message: 'Vendor updated successfully' });
    } catch (error) {
        console.error('Error updating vendor:', error);
        res.status(500).json({ message: 'Error updating vendor', error: error.message });
    }
}



async function deleteVendor(req, res) {
    try {
        const db = req.app.locals.db;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        const vendorId = req.params.id;

        // MongoDB delete logic
        if (dbType === 'mongodb') {
            await db.collection('vendors').deleteOne({ _id: new db.ObjectId(vendorId) });
        } 
        // PostgreSQL (Supabase uses PostgreSQL) delete logic
        else if (dbType === 'mysql' || dbType === 'supabase') {
            await db.query('DELETE FROM vendors WHERE id = $1', [vendorId]);
        } 
        // Firebase Firestore delete logic
        else if (dbType === 'firebase') {
            await db.collection('vendors').doc(vendorId).delete();
        } else {
            throw new Error('Unsupported database type');
        }

        res.status(200).json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        console.error('Error deleting vendor:', error);
        res.status(500).json({ message: 'Error deleting vendor', error: error.message });
    }
}

module.exports = {
    getVendors,
    createVendor,
    getVendorById,
    updateVendor,
    deleteVendor,
};

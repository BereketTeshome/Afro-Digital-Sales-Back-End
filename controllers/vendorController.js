const Vendor = require('../models/vendorModel');

// Haversine formula to calculate the distance between two lat/long points
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

// Get nearby vendors with pagination
async function getNearbyVendors(req, res) {
    try {
        const db = req.app.locals.db;
        const dbType = req.app.locals.dbType;
        const { mylat, mylon, kilometer, page = 1, limit = 10 } = req.params;  // Get lat, lon, and distance from params

        // Pagination
        const skip = (page - 1) * limit;

        // Fetch all vendors
        let vendors;

        if (dbType === 'mongodb') {
            vendors = await db.collection('vendors')
                               .skip(skip)
                               .limit(limit)
                               .toArray();
        } else if (dbType === 'mysql') {
            const result = await db.promise().query('SELECT * FROM vendors LIMIT ?, ?', [skip, limit]);
            vendors = result[0];
        } else if (dbType === 'supabase') {
            const { data, error } = await db.from('vendors').select('*').range(skip, skip + limit - 1);
            if (error) throw new Error(error.message);
            vendors = data;
        } else if (dbType === 'firebase') {
            const snapshot = await db.collection('vendors')
                                      .offset(skip)
                                      .limit(limit)
                                      .get();
            vendors = snapshot.docs.map(doc => doc.data());
        }

        // Filter vendors based on proximity
        const nearbyVendors = vendors.filter(vendor => {
            if (!vendor.lat || !vendor.long) return false;  // Skip vendors without location data
            const distanceToVendor = haversine(parseFloat(mylat), parseFloat(mylon), vendor.lat, vendor.long);  // Calculate distance
            return distanceToVendor <= parseFloat(kilometer);  // Filter vendors within the specified distance
        });

        // Get total count for pagination
        let totalCount;
        if (dbType === 'mongodb') {
            totalCount = await db.collection('vendors').countDocuments();
        } else if (dbType === 'mysql' || dbType === 'supabase') {
            const countResult = await db.query('SELECT COUNT(*) as total FROM vendors');
            totalCount = countResult[0][0].total;
        } else if (dbType === 'firebase') {
            totalCount = (await db.collection('vendors').get()).size;
        }

        // Return the filtered vendors and pagination info
        res.status(200).json({
            data: nearbyVendors,
            pagination: {
                page,
                limit,
                totalCount,
            }
        });
    } catch (error) {
        console.error('Error fetching nearby vendors:', error);
        res.status(500).json({ message: 'Error fetching nearby vendors', error: error.message });
    }
}

async function getVendors(req, res) {
    try {
        const db = req.app.locals.db;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10;  // Default to limit 10 if not provided
        const skip = (page - 1) * limit; // Calculate the number of records to skip for pagination
        let vendors;

        console.log("DB TYPE", dbType);

        if (dbType === 'mongodb') {
            // MongoDB logic with pagination
            vendors = await db.collection('vendors')
                               .find()
                               .skip(skip)
                               .limit(limit)
                               .toArray();
        } 
        else if (dbType === 'mysql') {
            // MySQL logic with pagination
            const result = await db.promise().query('SELECT * FROM vendors LIMIT ?, ?', [skip, limit]);
            vendors = result[0];  // Rows returned from the query
        } 
        else if (dbType === 'supabase') {
            // Supabase (PostgreSQL) logic with pagination
            const { data, error } = await db.from('vendors').select('*').range(skip, skip + limit - 1);
            
            if (error) throw new Error(error.message);

            vendors = data;
        }
        else if (dbType === 'firebase') {
            // Firebase logic with pagination (FireStore)
            const snapshot = await db.collection('vendors')
                                      .offset(skip)
                                      .limit(limit)
                                      .get();
            vendors = snapshot.docs.map(doc => doc.data());
        }
        else {
            throw new Error('Unsupported database type');
        }

        // Get the total number of records for pagination info
        let totalCount;
        if (dbType === 'mongodb') {
            totalCount = await db.collection('vendors').countDocuments();
        } else if (dbType === 'mysql' || dbType === 'supabase') {
            const countResult = await db.query('SELECT COUNT(*) as total FROM vendors');
            totalCount = countResult[0][0].total;
        } else if (dbType === 'firebase') {
            totalCount = (await db.collection('vendors').get()).size;
        }

        res.status(200).json({
            data: vendors,
            pagination: {
                page,
                limit,
                totalCount,
            }
        });

    } catch (error) {
        console.error('Error fetching vendors:', error);
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
    getNearbyVendors
};

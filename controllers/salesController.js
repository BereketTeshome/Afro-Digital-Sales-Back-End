const Sales = require('../models/salesModel');


// Haversine formula to calculate distance between two points in kilometers
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
}

async function getNearSales(req, res) {
    try {
        const db = req.app.locals.db;
        const dbType = req.app.locals.dbType; // Get database type
        const lat = parseFloat(req.params.lat);  // Latitude
        const lon = parseFloat(req.params.lon);  // Longitude
        const radius = parseFloat(req.params.radius);  // Radius in kilometers
        const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10;  // Default to limit 10 if not provided
        const skip = (page - 1) * limit;  // Calculate the number of records to skip for pagination
        let sales;

        // MongoDB logic
        if (dbType === 'mongodb') {
            const salesCollection = db.collection('sales');
            const geoOptions = {
                near: { type: "Point", coordinates: [lon, lat] },  // GeoJSON point (longitude, latitude)
                spherical: true,
                maxDistance: radius * 1000,  // Convert radius to meters
                distanceField: "distance",
            };

            sales = await salesCollection.aggregate([
                { $geoNear: geoOptions },
                { $skip: skip },
                { $limit: limit }
            ]).toArray();
        } 
        // Firebase logic
        else if (dbType === 'firebase') {
            const salesRef = db.collection('sales');
            const snapshot = await salesRef.get();
        
            // Filter sales by proximity using Haversine formula
            sales = snapshot.docs.filter(doc => {
                const location = doc.data().location; // Access the location field
                if (location && location.latitude && location.longitude) {
                    const distance = haversine(lat, lon, location.latitude, location.longitude); // Calculate distance
                    return distance <= radius;
                }
                return false; // If location is not valid, don't include the sale
            }).slice(skip, skip + limit); // Apply pagination after filtering
        }
        // MySQL logic
        else if (dbType === 'mysql') {
            const sql = `
                SELECT *, 
                    (6371 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lon) - radians(?)) + sin(radians(?)) * sin(radians(lat)))) AS distance
                FROM sales
                HAVING distance < ?
                ORDER BY distance
                LIMIT ?, ?
            `;
            const [rows] = await db.promise().query(sql, [lat, lon, lat, radius, skip, limit]);

            const totalCountResult = await db.promise().query(`
                SELECT COUNT(*) AS total
                FROM sales
                HAVING distance < ?
            `, [radius]);

            sales = rows;
            const totalCount = totalCountResult[0].total;

            res.status(200).json({
                data: sales,
                pagination: {
                    page,
                    limit,
                    totalCount,
                }
            });
        } 
        // Supabase logic
        else if (dbType === 'supabase') {
            const { data, error } = await db
                .from('sales')
                .select('*')
                .filter('ST_DistanceSphere(location, ST_SetSRID(ST_MakePoint(?, ?), 4326))', '<', radius * 1000)
                .range(skip, skip + limit - 1);

            if (error) throw new Error(error.message);

            const { count, error: countError } = await db
                .from('sales')
                .select('id', { count: 'exact' })
                .filter('ST_DistanceSphere(location, ST_SetSRID(ST_MakePoint(?, ?), 4326))', '<', radius * 1000);

            if (countError) throw new Error(countError.message);

            res.status(200).json({
                data,
                pagination: {
                    page,
                    limit,
                    totalCount: count,
                }
            });
        } 
        else {
            throw new Error('Unsupported database type for geospatial query');
        }
    } catch (error) {
        console.error('Error fetching near sales:', error);
        res.status(500).json({ message: 'Error fetching near sales', error: error.message });
    }
}




async function getSales(req, res) {
    try {
        const db = req.app.locals.db;
        const dbType = req.app.locals.dbType; // Get database type (firebase, mongodb, etc.)
        const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10;  // Default to limit 10 if not provided
        const skip = (page - 1) * limit; // Calculate the number of records to skip for pagination
        let sales;

        console.log("DB TYPE", dbType);

        if (dbType === 'mongodb') {
            // MongoDB logic with pagination
            sales = await db.collection('sales')
                             .find()
                             .skip(skip)
                             .limit(limit)
                             .toArray();
        } 
        else if (dbType === 'mysql') {
            // MySQL logic with pagination
            const result = await db.promise().query('SELECT * FROM sales LIMIT ?, ?', [skip, limit]);
            sales = result[0];  // Rows returned from the query
        } 
        else if (dbType === 'supabase') {
            // Supabase (PostgreSQL) logic with pagination
            const { data, error } = await db.from('sales').select('*').range(skip, skip + limit - 1);
            
            if (error) throw new Error(error.message);

            sales = data;
        }
        else if (dbType === 'firebase') {
            // Firebase logic with pagination (FireStore)
            const snapshot = await db.collection('sales')
                                      .offset(skip)
                                      .limit(limit)
                                      .get();
            sales = snapshot.docs.map(doc => doc.data());
        }
        else {
            throw new Error('Unsupported database type');
        }

        // Get the total number of records for pagination info
        let totalCount;
        if (dbType === 'mongodb') {
            totalCount = await db.collection('sales').countDocuments();
        } else if (dbType === 'mysql' || dbType === 'supabase') {
            const countResult = await db.query('SELECT COUNT(*) as total FROM sales');
            totalCount = countResult[0][0].total;
        } else if (dbType === 'firebase') {
            totalCount = (await db.collection('sales').get()).size;
        }

        res.status(200).json({
            data: sales,
            pagination: {
                page,
                limit,
                totalCount,
            }
        });

    } catch (error) {
        console.error('Error fetching sales:', error);
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
    getNearSales
};

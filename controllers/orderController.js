
const getOrders = async (req, res) => {
    const db = req.app.locals.db; // Get the database instance
    const dbType = req.app.locals.dbType; // Get the database type (firebase, mongodb, etc.)
    console.log("DB TYPE", dbType);

    // Get pagination parameters (with default values)
    const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10;  // Default to limit of 10 if not provided
    const skip = (page - 1) * limit;  // Calculate how many records to skip

    try {
        let orders;
        let totalCount;

        if (dbType === 'firebase') {
            // Firebase-specific logic (using Firestore)
            const snapshot = await db.collection('orders').offset(skip).limit(limit).get();
            orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Firebase doesn't directly support counting, so this is just an approximation
            totalCount = (await db.collection('orders').get()).size;  // Total count of orders
        } else if (dbType === 'mongodb') {
            // MongoDB logic
            const Order = require('../models/orderModel'); // Assuming you have the Order model
            orders = await Order.find().skip(skip).limit(limit); // Pagination logic
            totalCount = await Order.countDocuments(); // Count total orders
        } else if (dbType === 'mysql') {
            // MySQL logic
            const [rows] = await db.promise().query('SELECT * FROM orders LIMIT ? OFFSET ?', [limit, skip]);
            orders = rows;

            // Get the total number of orders for pagination
            const [countRows] = await db.promise().query('SELECT COUNT(*) as total FROM orders');
            totalCount = countRows[0].total;
        } else if (dbType === 'supabase') {
            // Supabase logic (PostgreSQL)
            const { data, error } = await db
                .from('orders')
                .select('*')
                .range(skip, skip + limit - 1);  // Paginate using range

            if (error) throw new Error(error.message);

            orders = data;

            // Get the total count for pagination
            const { countError, count } = await db
                .from('orders')
                .select('*', { count: 'exact' });

            if (countError) throw new Error(countError.message);

            totalCount = count;
        } else {
            throw new Error('Unsupported database type');
        }

        // Send response with pagination info
        res.status(200).json({
            data: orders,
            pagination: {
                page,
                limit,
                totalCount
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};


const createOrder = async (req, res) => {
    const db = req.app.locals.db; // Get the database instance
    const dbType = req.app.locals.dbType; // Get the database type (firebase, mongodb, etc.)
    console.log("DB TYPE", dbType);

    try {
        const newOrder = req.body;

        if (dbType === 'firebase') {
            // Firebase-specific logic (using Firestore)
            const ordersRef = db.collection('orders').doc(); // Firestore example
            await ordersRef.set(newOrder); // Set order data
            res.status(201).json({ message: 'Order created successfully' });
        } else if (dbType === 'mongodb') {
            // MongoDB logic
            const Order = require('../models/orderModel'); 
            const order = new Order(newOrder);
            await order.save();
            res.status(201).json({ message: 'Order created successfully', order });
        } else if (dbType === 'mysql') {
            // MySQL logic
            const [rows] = await db.promise().query(
                'INSERT INTO orders (p_id, p_name, p_price, p_description, category, p_image, vendor_id, discount, quantity, featured, per_sales_drag, lat, long, is_new, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    newOrder.p_id,
                    newOrder.p_name,
                    newOrder.p_price,
                    newOrder.p_description || '',
                    newOrder.category,
                    newOrder.p_image || null,
                    newOrder.vendor_id,
                    newOrder.discount || 0,
                    newOrder.quantity || 0,
                    newOrder.featured || false,
                    newOrder.per_sales_drag || null,
                    newOrder.lat || null,
                    newOrder.long || null,
                    newOrder.is_new || true,
                    newOrder.createdAt || new Date(),
                ]
            );
            res.status(201).json({ message: 'Order created successfully', rows });
        } else if (dbType === 'supabase') {
            // Supabase logic (PostgreSQL)
            const { data, error } = await db.from('orders').insert([newOrder]);

            if (error) throw new Error(error.message);

            res.status(201).json({ message: 'Order created successfully', data });
        } else {
            throw new Error('Unsupported database type');
        }
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};




const getOrderById = async (req, res) => {
    const db = req.app.locals.db; // Get the database instance
    const dbType = req.app.locals.dbType; // Get the database type (firebase, mongodb, etc.)
    const orderId = req.params.id; // Order ID from request parameters
    console.log("DB TYPE", dbType);

    try {
        let order;

        if (dbType === 'firebase') {
            // Firebase-specific logic (using Firestore)
            const doc = await db.collection('orders').doc(orderId).get();
            if (doc.exists) {
                order = { id: doc.id, ...doc.data() }; // Include document ID
            }
        } else if (dbType === 'mongodb') {
            // MongoDB logic
            const Order = require('../models/orderModel'); // Assuming you have the Order model
            order = await Order.findById(orderId); // Fetch order by ID
        } else if (dbType === 'mysql') {
            // MySQL logic
            const [rows] = await db.promise().query('SELECT * FROM orders WHERE id = ?', [orderId]);
            order = rows[0]; // Fetch the first result
        } else if (dbType === 'supabase') {
            // Supabase logic (PostgreSQL)
            const { data, error } = await db
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (error) throw new Error(error.message);
            order = data;
        } else {
            throw new Error('Unsupported database type');
        }

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
};



const updateOrder = async (req, res) => {
    const db = req.app.locals.db; // Get the database instance
    const dbType = req.app.locals.dbType; // Get the database type (firebase, mongodb, etc.)
    const orderId = req.params.id; // Order ID from request parameters
    const updatedData = req.body; // Data to update
    console.log("DB TYPE", dbType);

    try {
        if (dbType === 'firebase') {
            // Firebase-specific logic (using Firestore)
            const doc = await db.collection('orders').doc(orderId).get();
            if (!doc.exists) {
                return res.status(404).json({ message: 'Order not found' });
            }
            await db.collection('orders').doc(orderId).update(updatedData);
        } else if (dbType === 'mongodb') {
            // MongoDB logic
            const Order = require('../models/orderModel'); // Assuming you have the Order model
            const result = await Order.findByIdAndUpdate(orderId, updatedData, { new: true });
            if (!result) {
                return res.status(404).json({ message: 'Order not found' });
            }
        } else if (dbType === 'mysql') {
            // MySQL logic
            const keys = Object.keys(updatedData).map((key) => `${key} = ?`).join(', ');
            const values = [...Object.values(updatedData), orderId];
            const [rows] = await db.promise().query(`UPDATE orders SET ${keys} WHERE id = ?`, values);
            if (rows.affectedRows === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }
        } else if (dbType === 'supabase') {
            // Supabase logic (PostgreSQL)
            const { data, error } = await db
                .from('orders')
                .update(updatedData)
                .eq('id', orderId);

            if (error) throw new Error(error.message);
            if (!data || data.length === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }
        } else {
            throw new Error('Unsupported database type');
        }

        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Error updating order', error: error.message });
    }
};


const deleteOrder = async (req, res) => {
    const db = req.app.locals.db; // Get the database instance
    const dbType = req.app.locals.dbType; // Get the database type (firebase, mongodb, etc.)
    const orderId = req.params.id; // Order ID from request parameters
    console.log("DB TYPE", dbType);

    try {
        if (dbType === 'firebase') {
            // Firebase-specific logic (using Firestore)
            const doc = await db.collection('orders').doc(orderId).get();
            if (!doc.exists) {
                return res.status(404).json({ message: 'Order not found' });
            }
            await db.collection('orders').doc(orderId).delete();
        } else if (dbType === 'mongodb') {
            // MongoDB logic
            const Order = require('../models/orderModel'); // Assuming you have the Order model
            const result = await Order.findByIdAndDelete(orderId);
            if (!result) {
                return res.status(404).json({ message: 'Order not found' });
            }
        } else if (dbType === 'mysql') {
            // MySQL logic
            const [rows] = await db.promise().query('DELETE FROM orders WHERE id = ?', [orderId]);
            if (rows.affectedRows === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }
        } else if (dbType === 'supabase') {
            // Supabase logic (PostgreSQL)
            const { data, error } = await db.from('orders').delete().eq('id', orderId);

            if (error) throw new Error(error.message);
            if (!data || data.length === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }
        } else {
            throw new Error('Unsupported database type');
        }

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
};

module.exports = {
    getOrders,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder,
};

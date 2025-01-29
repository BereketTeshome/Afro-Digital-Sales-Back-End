
const getProducts = async (req, res) => {
    const db = req.app.locals.db; // Get the database instance
    const dbType = req.app.locals.dbType; // Get the database type (firebase, mongodb, etc.)
    console.log("DB TYPE", dbType);

    // Get pagination parameters (with default values)
    const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10;  // Default to limit of 10 if not provided
    const skip = (page - 1) * limit;  // Calculate how many records to skip

    try {
        let products;
        let totalCount;

        if (dbType === 'firebase') {
            // Firebase-specific logic (using Firestore)
            const snapshot = await db.collection('products').offset(skip).limit(limit).get();
            products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Firebase doesn't directly support counting, so this is just an approximation
            totalCount = (await db.collection('products').get()).size;  // Total count of products
        } else if (dbType === 'mongodb') {
            // MongoDB logic
            const Product = require('../models/productModel'); // Assuming you have the Product model
            products = await Product.find().skip(skip).limit(limit); // Pagination logic
            totalCount = await Product.countDocuments(); // Count total products
        } else if (dbType === 'mysql') {
            // MySQL logic
            const [rows] = await db.promise().query('SELECT * FROM products LIMIT ? OFFSET ?', [limit, skip]);
            products = rows;

            // Get the total number of products for pagination
            const [countRows] = await db.promise().query('SELECT COUNT(*) as total FROM products');
            totalCount = countRows[0].total;
        } else if (dbType === 'supabase') {
            // Supabase logic (PostgreSQL)
            const { data, error } = await db
                .from('products')
                .select('*')
                .range(skip, skip + limit - 1);  // Paginate using range

            if (error) throw new Error(error.message);

            products = data;

            // Get the total count for pagination
            const { countError, count } = await db
                .from('products')
                .select('*', { count: 'exact' });

            if (countError) throw new Error(countError.message);

            totalCount = count;
        } else {
            throw new Error('Unsupported database type');
        }

        // Send response with pagination info
        res.status(200).json({
            data: products,
            pagination: {
                page,
                limit,
                totalCount
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};




const createProduct = async (req, res) => {
    const db = req.app.locals.db; // Get the database instance
    const dbType = req.app.locals.dbType; // Get the database type (firebase, mongodb, etc.)
    console.log("DB TYPE", dbType);

    try {
        const newProduct = req.body;

        if (dbType === 'firebase') {
            // Firebase-specific logic (using Firestore)
            const productsRef = db.collection('products').doc(); // Firestore example
            await productsRef.set(newProduct); // Set product data
            res.status(201).json({ message: 'Product created successfully' });
        } else if (dbType === 'mongodb') {
            // MongoDB logic
            const Product = require('../models/productModel'); // Assuming you have the Product model defined
            const product = new Product(newProduct);
            await product.save();
            res.status(201).json({ message: 'Product created successfully', product });
        } else if (dbType === 'mysql') {
            // MySQL logic
            const [rows] = await db.promise().query(
                'INSERT INTO products (p_id, p_name, p_price, p_description, category, p_image, vendor_id, discount, quantity, featured, per_sales_drag, lat, long, is_new, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    newProduct.p_id,
                    newProduct.p_name,
                    newProduct.p_price,
                    newProduct.p_description || '',
                    newProduct.category,
                    newProduct.p_image || null,
                    newProduct.vendor_id,
                    newProduct.discount || 0,
                    newProduct.quantity || 0,
                    newProduct.featured || false,
                    newProduct.per_sales_drag || null,
                    newProduct.lat || null,
                    newProduct.long || null,
                    newProduct.is_new || true,
                    newProduct.createdAt || new Date(),
                ]
            );
            res.status(201).json({ message: 'Product created successfully', rows });
        } else if (dbType === 'supabase') {
            // Supabase logic (PostgreSQL)
            const { data, error } = await db.from('products').insert([newProduct]);

            if (error) throw new Error(error.message);

            res.status(201).json({ message: 'Product created successfully', data });
        } else {
            throw new Error('Unsupported database type');
        }
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
};




const getProductById = async (req, res) => {
    const db = req.app.locals.db; // Get the database instance
    const dbType = req.app.locals.dbType; // Get the database type (firebase, mongodb, etc.)
    const productId = req.params.id; // Product ID from request parameters
    console.log("DB TYPE", dbType);

    try {
        let product;

        if (dbType === 'firebase') {
            // Firebase-specific logic (using Firestore)
            const doc = await db.collection('products').doc(productId).get();
            if (doc.exists) {
                product = { id: doc.id, ...doc.data() }; // Include document ID
            }
        } else if (dbType === 'mongodb') {
            // MongoDB logic
            const Product = require('../models/productModel'); // Assuming you have the Product model
            product = await Product.findById(productId); // Fetch product by ID
        } else if (dbType === 'mysql') {
            // MySQL logic
            const [rows] = await db.promise().query('SELECT * FROM products WHERE id = ?', [productId]);
            product = rows[0]; // Fetch the first result
        } else if (dbType === 'supabase') {
            // Supabase logic (PostgreSQL)
            const { data, error } = await db
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw new Error(error.message);
            product = data;
        } else {
            throw new Error('Unsupported database type');
        }

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};



const updateProduct = async (req, res) => {
    const db = req.app.locals.db; // Get the database instance
    const dbType = req.app.locals.dbType; // Get the database type (firebase, mongodb, etc.)
    const productId = req.params.id; // Product ID from request parameters
    const updatedData = req.body; // Data to update
    console.log("DB TYPE", dbType);

    try {
        if (dbType === 'firebase') {
            // Firebase-specific logic (using Firestore)
            const doc = await db.collection('products').doc(productId).get();
            if (!doc.exists) {
                return res.status(404).json({ message: 'Product not found' });
            }
            await db.collection('products').doc(productId).update(updatedData);
        } else if (dbType === 'mongodb') {
            // MongoDB logic
            const Product = require('../models/productModel'); // Assuming you have the Product model
            const result = await Product.findByIdAndUpdate(productId, updatedData, { new: true });
            if (!result) {
                return res.status(404).json({ message: 'Product not found' });
            }
        } else if (dbType === 'mysql') {
            // MySQL logic
            const keys = Object.keys(updatedData).map((key) => `${key} = ?`).join(', ');
            const values = [...Object.values(updatedData), productId];
            const [rows] = await db.promise().query(`UPDATE products SET ${keys} WHERE id = ?`, values);
            if (rows.affectedRows === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }
        } else if (dbType === 'supabase') {
            // Supabase logic (PostgreSQL)
            const { data, error } = await db
                .from('products')
                .update(updatedData)
                .eq('id', productId);

            if (error) throw new Error(error.message);
            if (!data || data.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }
        } else {
            throw new Error('Unsupported database type');
        }

        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};


const deleteProduct = async (req, res) => {
    const db = req.app.locals.db; // Get the database instance
    const dbType = req.app.locals.dbType; // Get the database type (firebase, mongodb, etc.)
    const productId = req.params.id; // Product ID from request parameters
    console.log("DB TYPE", dbType);

    try {
        if (dbType === 'firebase') {
            // Firebase-specific logic (using Firestore)
            const doc = await db.collection('products').doc(productId).get();
            if (!doc.exists) {
                return res.status(404).json({ message: 'Product not found' });
            }
            await db.collection('products').doc(productId).delete();
        } else if (dbType === 'mongodb') {
            // MongoDB logic
            const Product = require('../models/productModel'); // Assuming you have the Product model
            const result = await Product.findByIdAndDelete(productId);
            if (!result) {
                return res.status(404).json({ message: 'Product not found' });
            }
        } else if (dbType === 'mysql') {
            // MySQL logic
            const [rows] = await db.promise().query('DELETE FROM products WHERE id = ?', [productId]);
            if (rows.affectedRows === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }
        } else if (dbType === 'supabase') {
            // Supabase logic (PostgreSQL)
            const { data, error } = await db.from('products').delete().eq('id', productId);

            if (error) throw new Error(error.message);
            if (!data || data.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }
        } else {
            throw new Error('Unsupported database type');
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};

module.exports = {
    getProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
};

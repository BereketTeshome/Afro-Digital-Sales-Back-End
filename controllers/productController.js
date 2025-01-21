async function getProducts(req, res) {
    try {
        const db = req.app.locals.db;
        let products;

        if (db.collection) {
            products = await db.collection('products').find().toArray();  // MongoDB
        } else if (db.query) {
            const result = await db.query('SELECT * FROM products');  // PostgreSQL
            products = result.rows;
        } else {
            const snapshot = await db.firestore().collection('products').get();  // Firebase
            products = snapshot.docs.map(doc => doc.data());
        }

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
}

async function createProduct(req, res) {
    try {
        const db = req.app.locals.db;
        const newProduct = req.body;

        if (db.collection) {
            await db.collection('products').insertOne(newProduct);  // MongoDB
        } else if (db.query) {
            await db.query('INSERT INTO products (name, price) VALUES ($1, $2)', [newProduct.name, newProduct.price]);  // PostgreSQL
        } else {
            await db.firestore().collection('products').add(newProduct);  // Firebase
        }

        res.status(201).json({ message: 'Product created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
}

async function getProductById(req, res) {
    try {
        const db = req.app.locals.db;
        const productId = req.params.id;
        let product;

        if (db.collection) {
            product = await db.collection('products').findOne({ _id: new db.ObjectId(productId) });  // MongoDB
        } else if (db.query) {
            const result = await db.query('SELECT * FROM products WHERE id = $1', [productId]);  // PostgreSQL
            product = result.rows[0];
        } else {
            const doc = await db.firestore().collection('products').doc(productId).get();  // Firebase
            product = doc.data();
        }

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
}

async function updateProduct(req, res) {
    try {
        const db = req.app.locals.db;
        const productId = req.params.id;
        const updatedData = req.body;

        if (db.collection) {
            await db.collection('products').updateOne({ _id: new db.ObjectId(productId) }, { $set: updatedData });  // MongoDB
        } else if (db.query) {
            await db.query('UPDATE products SET name = $1, price = $2 WHERE id = $3', [updatedData.name, updatedData.price, productId]);  // PostgreSQL
        } else {
            await db.firestore().collection('products').doc(productId).update(updatedData);  // Firebase
        }

        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
}

async function deleteProduct(req, res) {
    try {
        const db = req.app.locals.db;
        const productId = req.params.id;

        if (db.collection) {
            await db.collection('products').deleteOne({ _id: new db.ObjectId(productId) });  // MongoDB
        } else if (db.query) {
            await db.query('DELETE FROM products WHERE id = $1', [productId]);  // PostgreSQL
        } else {
            await db.firestore().collection('products').doc(productId).delete();  // Firebase
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
}

module.exports = {
    getProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
};

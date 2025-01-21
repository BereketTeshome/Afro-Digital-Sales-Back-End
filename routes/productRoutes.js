const express = require('express');
const { getProducts, createProduct, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');

const router = express.Router();

// Route to get all products
router.get('/', async (req, res) => {
    await getProducts(req, res);
});

// Route to create a new product
router.post('/', async (req, res) => {
    await createProduct(req, res);
});

// Route to get a product by ID
router.get('/:id', async (req, res) => {
    await getProductById(req, res);
});

// Route to update a product
router.put('/:id', async (req, res) => {
    await updateProduct(req, res);
});

// Route to delete a product
router.delete('/:id', async (req, res) => {
    await deleteProduct(req, res);
});

module.exports = router;

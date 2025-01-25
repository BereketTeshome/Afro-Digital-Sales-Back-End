const express = require('express');
const { getNearSales,getSales, createSales, getSalesById, updateSales, deleteSales } = require('../controllers/salesController');

const router = express.Router();

// Route to get all saless
router.get('/', async (req, res) => {
    await getSales(req, res);
});

// Route to create a new sales
router.post('/', async (req, res) => {
    await createSales(req, res);
});

// Route to get a sales by ID
router.get('/:id', async (req, res) => {
    await getSalesById(req, res);
});

// Route to update a sales
router.put('/:id', async (req, res) => {
    await updateSales(req, res);
});

// Route to delete a sales
router.delete('/:id', async (req, res) => {
    await deleteSales(req, res);
});
// Route to get near sales with pagination
router.get('/near/:lat/:lon/:radius', async (req, res) => {
    await getNearSales(req, res);
});


module.exports = router;

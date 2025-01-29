const express = require('express');
const { getOrders, createOrder, getOrderById, updateOrder, deleteOrder } = require('../controllers/orderController');

const router = express.Router();

// Route to get all orders
router.get('/', async (req, res) => {
    await getOrders(req, res);
});

// Route to create a new order
router.post('/', async (req, res) => {
    await createOrder(req, res);
});

// Route to get a order by ID
router.get('/:id', async (req, res) => {
    await getOrderById(req, res);
});

// Route to update a order
router.put('/:id', async (req, res) => {
    await updateOrder(req, res);
});

// Route to delete a order
router.delete('/:id', async (req, res) => {
    await deleteOrder(req, res);
});

module.exports = router;

const express = require('express');
const { getCustomers, createCustomer, getCustomerById, updateCustomer, deleteCustomer } = require('../controllers/customerController');

const router = express.Router();

// Route to get all customers
router.get('/', async (req, res) => {
    await getCustomers(req, res);
});

// Route to create a new customer
router.post('/', async (req, res) => {
    await createCustomer(req, res);
});

// Route to get a customer by ID
router.get('/:id', async (req, res) => {
    await getCustomerById(req, res);
});

// Route to update a customer
router.put('/:id', async (req, res) => {
    await updateCustomer(req, res);
});

// Route to delete a customer
router.delete('/:id', async (req, res) => {
    await deleteCustomer(req, res);
});

module.exports = router;

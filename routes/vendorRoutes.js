const express = require('express');
const { getVendors, createVendor, getVendorById, updateVendor, deleteVendor } = require('../controllers/vendorController');

const router = express.Router();

// Route to get all vendors
router.get('/', async (req, res) => {
    await getVendors(req, res);
});

// Route to create a new vendor
router.post('/', async (req, res) => {
    await createVendor(req, res);
});

// Route to get a vendor by ID
router.get('/:id', async (req, res) => {
    await getVendorById(req, res);
});

// Route to update a vendor
router.put('/:id', async (req, res) => {
    await updateVendor(req, res);
});

// Route to delete a vendor
router.delete('/:id', async (req, res) => {
    await deleteVendor(req, res);
});

module.exports = router;

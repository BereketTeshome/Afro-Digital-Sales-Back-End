const express = require('express');
const { getUsers, createUser, getUserById, updateUser, deleteUser } = require('../controllers/userController');

const router = express.Router();

// Route to get all users
router.get('/', async (req, res) => {
    await getUsers(req, res);
});

// Route to create a new user
router.post('/', async (req, res) => {
    await createUser(req, res);
});

// Route to get a user by ID
router.get('/:id', async (req, res) => {
    await getUserById(req, res);
});

// Route to update a user
router.put('/:id', async (req, res) => {
    await updateUser(req, res);
});

// Route to delete a user
router.delete('/:id', async (req, res) => {
    await deleteUser(req, res);
});

module.exports = router;

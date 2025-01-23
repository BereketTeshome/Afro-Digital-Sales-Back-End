const express = require('express');
const { getUsers, createUser, getUserById, updateUser, deleteUser } = require('../controllers/authController');

const router = express.Router();

// Route to get all users
// router.get('/', async (req, res) => {
//     await getUsers(req, res);
// });
// Route to get all users
// router.get('/', async (req, res) => {
//     try {
//         // Simulate some operation (like fetching users from a database)
//         const users = ['User1', 'User2', 'User3'];  // Example data for testing

//         // Send a response to confirm the route is working
//         res.status(200).json({
//             message: 'Route is working!',
//             users: users  // Return the sample data
//         });
//     } catch (err) {
//         // Handle errors
//         res.status(500).json({ message: 'Error fetching users', error: err });
//     }
// });


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

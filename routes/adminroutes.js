const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authmiddleware');
const allowRoles = require('../middleware/rolemiddleware');
const {
    adminLogin,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/admincontroller');

router.post('/login', adminLogin);

router.use(verifyToken, allowRoles('admin'));

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;

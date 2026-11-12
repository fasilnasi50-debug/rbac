
const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authmiddleware');

const userController = require('../controllers/usercontroller');

router.get(
    '/profile',
    verifyToken,
    userController.getMyProfile
);

router.put(
    '/profile',
    verifyToken,
    userController.updateMyProfile
);

module.exports = router;

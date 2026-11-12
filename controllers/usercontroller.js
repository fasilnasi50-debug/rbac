
const db = require('../config/db');

const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [users] = await db.execute(
            `SELECT id, full_name, email, phone, address, created_at
             FROM users WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile fetched successfully',
            user: users[0]
        });

    } catch (error) {
        console.error('Get profile error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({
                success: false,
                message: 'Request body must be a JSON object'
            });
        }

        const userId = req.user.id;
        const { full_name, phone, address } = req.body;

        if (
            full_name !== undefined &&
            (typeof full_name !== 'string' || !full_name.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid full name'
            });
        }

        if (
            phone !== undefined &&
            phone !== null &&
            typeof phone !== 'string'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number'
            });
        }

        if (
            address !== undefined &&
            address !== null &&
            typeof address !== 'string'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid address'
            });
        }

        const [users] = await db.execute(
            'SELECT id, full_name, phone, address FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const currentUser = users[0];

        const updatedName = full_name !== undefined
            ? full_name.trim()
            : currentUser.full_name;

        const updatedPhone = phone !== undefined
            ? phone
            : currentUser.phone;

        const updatedAddress = address !== undefined
            ? address
            : currentUser.address;

        await db.execute(
            `UPDATE users
             SET full_name = ?, phone = ?, address = ?
             WHERE id = ?`,
            [updatedName, updatedPhone, updatedAddress, userId]
        );

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Update profile error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile
};

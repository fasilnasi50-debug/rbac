
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLogin = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({
                success: false,
                message: 'Request body must be a JSON object'
            });
        }

        const { email, password } = req.body;

        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const [admins] = await db.execute(
            'SELECT * FROM admins WHERE email = ?',
            [cleanEmail]
        );

        if (admins.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const admin = admins[0];

        const isMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            {
                id: admin.id,
                role: 'admin'
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '1d'
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Admin login successful',
            token,
            admin: {
                id: admin.id,
                full_name: admin.full_name,
                email: admin.email,
                role: 'admin'
            }
        });

    } catch (error) {
        console.error('Admin login error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.execute(
            `SELECT id, full_name, email, phone, address, created_at
             FROM users`
        );

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        console.error('Get all users error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
const getUserById = async (req, res) => {
    try {
        const userId = Number(req.params.id);

        if (!Number.isSafeInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

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

        res.status(200).json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('Get user error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateUser = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({
                success: false,
                message: 'Request body must be a JSON object'
            });
        }

        const userId = Number(req.params.id);
        const { full_name, phone, address } = req.body;

        if (!Number.isSafeInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        if (
            full_name !== undefined &&
            (typeof full_name !== 'string' || !full_name.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid full name'
            });
        }

        if (phone !== undefined && phone !== null && typeof phone !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone'
            });
        }

        if (address !== undefined && address !== null && typeof address !== 'string') {
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

        const user = users[0];

        await db.execute(
            `UPDATE users
             SET full_name = ?, phone = ?, address = ?
             WHERE id = ?`,
            [
                full_name !== undefined ? full_name.trim() : user.full_name,
                phone !== undefined ? phone : user.phone,
                address !== undefined ? address : user.address,
                userId
            ]
        );

        res.status(200).json({
            success: true,
            message: 'User updated successfully'
        });

    } catch (error) {
        console.error('Update user error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = Number(req.params.id);

        if (!Number.isSafeInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const [result] = await db.execute(
            'DELETE FROM users WHERE id = ?',
            [userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
module.exports = {
    adminLogin,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
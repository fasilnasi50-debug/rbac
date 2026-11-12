
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({
                success: false,
                message: 'Request body must be a JSON object'
            });
        }

        const { full_name, email, password, phone, address } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Full name, email and password are required'
            });
        }

        if (
            typeof full_name !== 'string' ||
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !full_name.trim() ||
            !email.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }

        const cleanName = full_name.trim();
        const cleanEmail = email.trim().toLowerCase();

        const [existingUser] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [cleanEmail]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO users
            (full_name, email, password, phone, address)
            VALUES (?, ?, ?, ?, ?)`,
            [
                cleanName,
                cleanEmail,
                hashedPassword,
                phone || null,
                address || null
            ]
        );

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: result.insertId,
                full_name: cleanName,
                email: cleanEmail
            }
        });

    } catch (error) {
        console.error('Registration error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const login = async (req, res) => {
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

        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [cleanEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: 'user'
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '1d'
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: 'user'
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    register,
    login
};

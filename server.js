
const express = require('express');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userroutes');
const adminRoutes = require('./routes/adminroutes');
const app = express();


app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);


app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Role Based Access Control API is running'
    });
});


app.get('/db-test', async (req, res) => {
    try {
        const [result] = await db.query('SELECT 1 AS result');

        res.status(200).json({
            success: true,
            message: 'MySQL connected successfully',
            database: result[0].result
        });

    } catch (error) {
        console.error('Database error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Database connection failed'
        });
    }
});


const PORT = Number(process.env.PORT) || 5000;


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

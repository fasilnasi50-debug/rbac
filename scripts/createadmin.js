
const db = require('../config/db');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (message) => {
    return new Promise((resolve) => {
        rl.question(message, resolve);
    });
};

const createAdmin = async () => {
    try {
        const full_name = (await question('Enter admin name: ')).trim();
        const email = (await question('Enter admin email: ')).trim().toLowerCase();
        const password = await question('Enter admin password: ');

        if (!full_name || !email || !password) {
            console.log('All fields are required.');
            return;
        }

        if (password.length < 8) {
            console.log('Password must contain at least 8 characters.');
            return;
        }

        const [existingAdmin] = await db.execute(
            'SELECT id FROM admins WHERE email = ?',
            [email]
        );

        if (existingAdmin.length > 0) {
            console.log('Admin email already exists.');
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            `INSERT INTO admins (full_name, email, password)
             VALUES (?, ?, ?)`,
            [full_name, email, hashedPassword]
        );

        console.log('Admin created successfully!');

    }catch (error) {
        console.error('Admin creation error:', error.message);

    } finally {
        rl.close();
        await db.end();
    }
};

createAdmin();

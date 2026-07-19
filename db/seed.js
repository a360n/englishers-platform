// Seeding script to initialize the PostgreSQL database schema and create default manager and admin users.
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./index');

async function seed() {
    try {
        console.log('Reading schema file...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql on database...');
        await db.query(schemaSql);
        console.log('Schema created successfully.');

        // Generate hashed passwords
        console.log('Hashing passwords for default accounts...');
        const managerPasswordHash = await bcrypt.hash('Manager@Englishers2026', 10);
        const adminPasswordHash = await bcrypt.hash('Admin@Englishers2026', 10);

        // Seed Manager
        console.log('Inserting default Manager...');
        await db.query(
            `INSERT INTO users (username, password, role) VALUES ($1, $2, $3)`,
            ['manager', managerPasswordHash, 'manager']
        );

        // Seed Admin
        console.log('Inserting default Admin...');
        await db.query(
            `INSERT INTO users (username, password, role) VALUES ($1, $2, $3)`,
            ['admin', adminPasswordHash, 'admin']
        );

        // Seed Teacher
        console.log('Inserting default Teacher...');
        const teacherPasswordHash = await bcrypt.hash('Teacher@Englishers2026', 10);
        await db.query(
            `INSERT INTO users (username, password, role) VALUES ($1, $2, $3)`,
            ['teacher', teacherPasswordHash, 'teacher']
        );

        console.log('Database seeding finished successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
}

seed();

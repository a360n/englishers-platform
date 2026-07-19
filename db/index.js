// Database utility connection pool using pg
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'alial-khazali',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'englishers',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '5432'),
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};

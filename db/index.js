// Database utility connection pool using pg
const { Pool, types } = require('pg');
require('dotenv').config();

// Force PG to return DATE columns (oid 1082) as literal string 'YYYY-MM-DD' without converting to Date object
types.setTypeParser(1082, (val) => val);

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

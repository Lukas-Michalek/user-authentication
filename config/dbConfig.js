// Importing values from .env
require('dotenv').config();

const { Pool } = require('pg');

// This is going to look if our apps is hosted in production, and if it is in production isProduction is TRUE otherwise(if it is in Development) isProduction is set to FALSE
const isProduction = process.env.NODE_ENV === 'production';

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;


// If the app is in production => process.env.DATABASE_URL otherwise use connectionString
const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString
});

module.exports = { pool };


// src/db/index.js
require('dotenv').config();
const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');
const schema = require('./schema');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bizly_drizzle',
  port: Number(process.env.DB_PORT || 3306),
});

// Probar la conexión al iniciar
pool.getConnection()
  .then(connection => {
    console.log('¡Base de datos conectada exitosamente a MySQL (bizly_drizzle)!');
    connection.release();
  })
  .catch(error => {
    console.error('Error al conectar a la base de datos:', error.message);
  });

const db = drizzle(pool, { schema, mode: 'default' });

module.exports = {
  db,
  pool,
  schema,
};

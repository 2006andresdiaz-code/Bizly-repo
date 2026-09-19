// src/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bizly_db',
  port: process.env.DB_PORT || 3306
});

// Probar la conexión al iniciar
pool.getConnection()
  .then(connection => {
    console.log('¡Base de datos conectada exitosamente a MySQL!');
    connection.release(); // Liberar la conexión de vuelta al pool
  })
  .catch(error => {
    console.error('Error al conectar a la base de datos:', error.message);
  });

module.exports = pool;
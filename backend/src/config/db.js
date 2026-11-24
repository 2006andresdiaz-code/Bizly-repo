// src/config/db.js
const { db, pool } = require('../db');

// Exportar la instancia de Drizzle manteniendo compatibilidad con pool directo si fuera necesario
db.pool = pool;
db.query = (...args) => pool.query(...args);
db.getConnection = (...args) => pool.getConnection(...args);

module.exports = db;
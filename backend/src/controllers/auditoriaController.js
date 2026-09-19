// backend/src/controllers/auditoriaController.js
const db = require('../config/db');

// Obtener los registros de auditoría ordenados del más reciente al más antiguo
const obtenerAuditoria = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM auditoria ORDER BY created_at DESC LIMIT 100');
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener auditoría:", error);
    res.status(500).json({ error: "Error interno del servidor al consultar la auditoría" });
  }
};

module.exports = {
  obtenerAuditoria
};
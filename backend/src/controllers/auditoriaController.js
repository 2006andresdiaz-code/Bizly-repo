// backend/src/controllers/auditoriaController.js
const { db } = require('../db');
const { auditoria } = require('../db/schema');
const { desc } = require('drizzle-orm');

// Obtener los registros de auditoría ordenados del más reciente al más antiguo
const obtenerAuditoria = async (req, res) => {
  try {
    const rows = await db
      .select({
        id: auditoria.id,
        id_usuario: auditoria.idUsuario,
        accion: auditoria.accion,
        tabla: auditoria.tabla,
        id_registro: auditoria.idRegistro,
        datos_antes: auditoria.datosAntes,
        datos_despues: auditoria.datosDespues,
        ip_address: auditoria.ipAddress,
        created_at: auditoria.createdAt,
      })
      .from(auditoria)
      .orderBy(desc(auditoria.createdAt))
      .limit(100);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener auditoría:", error);
    res.status(500).json({ error: "Error interno del servidor al consultar la auditoría" });
  }
};

module.exports = {
  obtenerAuditoria
};
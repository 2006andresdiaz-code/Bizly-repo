// src/controllers/clienteController.js
const { db } = require('../db');
const { clientes, ventas } = require('../db/schema');
const { eq, and, ne, sql } = require('drizzle-orm');

// --- OBTENER CLIENTES (Con total de compras y gastos) ---
const obtenerClientes = async (req, res) => {
  try {
    const activo = req.query.activo === '0' ? 0 : 1;

    // Consulta que cruza clientes con ventas para sumar totales
    const rows = await db
      .select({
        id: clientes.id,
        nombre: clientes.nombre,
        apellido: clientes.apellido,
        documento: clientes.documento,
        email: clientes.email,
        telefono: clientes.telefono,
        direccion: clientes.direccion,
        activo: clientes.activo,
        created_at: clientes.createdAt,
        updated_at: clientes.updatedAt,
        total_compras: sql`COUNT(${ventas.id})`.mapWith(Number),
        total_gastado: sql`COALESCE(SUM(${ventas.total}), 0)`.mapWith(Number),
      })
      .from(clientes)
      .leftJoin(ventas, eq(clientes.id, ventas.idCliente))
      .where(eq(clientes.activo, activo))
      .groupBy(clientes.id);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error en el servidor al obtener clientes", detalle: error.message });
  }
};

// --- CREAR CLIENTE ---
const crearCliente = async (req, res) => {
  const { documento, nombre, apellido, telefono, email, direccion } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (nombre)' });
  }

  try {
    if (documento) {
      const existingDoc = await db
        .select({ id: clientes.id })
        .from(clientes)
        .where(eq(clientes.documento, documento));

      if (existingDoc.length > 0) {
        return res.status(400).json({ error: 'Ya existe un cliente registrado con este número de documento' });
      }
    }

    const [resultado] = await db.insert(clientes).values({
      documento: documento || null,
      nombre,
      apellido: apellido || '',
      telefono: telefono || null,
      email: email || null,
      direccion: direccion || null,
      activo: 1,
    });

    res.status(201).json({ mensaje: "Cliente creado con éxito", id: resultado.insertId });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({ error: "Error al registrar el cliente", detalle: error.message });
  }
};

// --- ACTUALIZAR CLIENTE (EDITAR) ---
const actualizarCliente = async (req, res) => {
  const { id } = req.params;
  const { documento, nombre, apellido, telefono, email, direccion } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  try {
    if (documento) {
      const existing = await db
        .select({ id: clientes.id })
        .from(clientes)
        .where(and(eq(clientes.documento, documento), ne(clientes.id, Number(id))));

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Ese documento ya pertenece a otro cliente' });
      }
    }

    const [resultado] = await db
      .update(clientes)
      .set({
        documento: documento || null,
        nombre,
        apellido: apellido || '',
        telefono: telefono || null,
        email: email || null,
        direccion: direccion || null,
      })
      .where(eq(clientes.id, Number(id)));

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ mensaje: 'Cliente actualizado con éxito' });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ error: 'Error en el servidor al actualizar', detalle: error.message });
  }
};

// --- DESACTIVAR CLIENTE ---
const desactivarCliente = async (req, res) => {
  const { id } = req.params;
  try {
    await db.update(clientes).set({ activo: 0 }).where(eq(clientes.id, Number(id)));
    res.json({ mensaje: 'Cliente desactivado correctamente' });
  } catch (error) {
    console.error("Error al desactivar:", error);
    res.status(500).json({ error: 'Error al desactivar el cliente' });
  }
};

// --- REACTIVAR CLIENTE ---
const reactivarCliente = async (req, res) => {
  const { id } = req.params;
  try {
    await db.update(clientes).set({ activo: 1 }).where(eq(clientes.id, Number(id)));
    res.json({ mensaje: 'Cliente reactivado correctamente' });
  } catch (error) {
    console.error("Error al reactivar:", error);
    res.status(500).json({ error: 'Error al reactivar el cliente' });
  }
};

module.exports = {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  desactivarCliente,
  reactivarCliente,
};
// src/controllers/clienteController.js
const db = require('../config/db');

// --- OBTENER CLIENTES (Con total de compras y gastos) ---
const obtenerClientes = async (req, res) => {
    try {
        const activo = req.query.activo === '0' ? 0 : 1;
        
        // Nueva consulta que cruza clientes con ventas para sumar totales
        const query = `
            SELECT 
                c.*, 
                COUNT(v.id) AS total_compras, 
                COALESCE(SUM(v.total), 0) AS total_gastado
            FROM clientes c
            LEFT JOIN ventas v ON c.id = v.id_cliente
            WHERE c.activo = ?
            GROUP BY c.id
        `;
        
        const [rows] = await db.query(query, [activo]);
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
            const [existingDoc] = await db.query('SELECT id FROM clientes WHERE documento = ?', [documento]);
            if (existingDoc.length > 0) {
                return res.status(400).json({ error: 'Ya existe un cliente registrado con este número de documento' });
            }
        }

        const [resultado] = await db.query(
            'INSERT INTO clientes (documento, nombre, apellido, telefono, email, direccion, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
            [documento || null, nombre, apellido || null, telefono || null, email || null, direccion || null]
        );
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
            const [existing] = await db.query('SELECT id FROM clientes WHERE documento = ? AND id != ?', [documento, id]);
            if (existing.length > 0) {
                return res.status(400).json({ error: 'Ese documento ya pertenece a otro cliente' });
            }
        }

        const [resultado] = await db.query(
            'UPDATE clientes SET documento = ?, nombre = ?, apellido = ?, telefono = ?, email = ?, direccion = ? WHERE id = ?',
            [documento || null, nombre, apellido || null, telefono || null, email || null, direccion || null, id]
        );

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
        await db.query('UPDATE clientes SET activo = 0 WHERE id = ?', [id]);
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
        await db.query('UPDATE clientes SET activo = 1 WHERE id = ?', [id]);
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
    reactivarCliente
};
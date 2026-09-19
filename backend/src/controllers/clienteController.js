// src/controllers/clienteController.js
const db = require('../config/db');

const obtenerClientes = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM clientes WHERE activo = 1');
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ mensaje: "Error en el servidor al obtener clientes", detalle: error.message });
    }
};

const crearCliente = async (req, res) => {
    const { documento, nombre, apellido, telefono, email, direccion } = req.body;

    if (!nombre || !apellido) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios (nombre, apellido)' });
    }

    try {
        // Verificar si el documento ya existe (si se envió)
        if (documento) {
            const [existingDoc] = await db.query('SELECT id FROM clientes WHERE documento = ?', [documento]);
            if (existingDoc.length > 0) {
                return res.status(400).json({ mensaje: 'Ya existe un cliente registrado con este número de documento' });
            }
        }

        const [resultado] = await db.query(
            'INSERT INTO clientes (documento, nombre, apellido, telefono, email, direccion, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
            [documento || null, nombre, apellido, telefono || null, email || null, direccion || null]
        );
        res.status(201).json({ mensaje: "Cliente creado con éxito", id: resultado.insertId });
    } catch (error) {
        console.error("Error al crear cliente:", error);
        res.status(500).json({ mensaje: "Error al registrar el cliente", detalle: error.message });
    }
};

module.exports = {
    obtenerClientes,
    crearCliente
};
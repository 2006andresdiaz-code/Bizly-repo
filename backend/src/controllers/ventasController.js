// src/controllers/ventasController.js
const db = require('../config/db');

// --- 1. FUNCIÓN PARA CREAR VENTAS (Con Transacción Segura) ---
exports.crearVenta = async (req, res) => {
  const connection = await db.getConnection(); 
  try {
    await connection.beginTransaction(); 

    const { id_cliente, id_usuario, total, metodo_pago, carrito } = req.body;

    if (!id_usuario || !total || !carrito || carrito.length === 0) {
      connection.release();
      return res.status(400).json({ error: 'Faltan campos obligatorios o el carrito está vacío' });
    }

    // Generamos un número de factura único automáticamente
    const numero_factura = `FAC-${Date.now().toString().slice(-8)}`;

    const [ventaResult] = await connection.query(
      `INSERT INTO ventas (numero_factura, id_cliente, id_vendedor, total, metodo_pago)
        VALUES (?, ?, ?, ?, ?)`,
      [numero_factura, id_cliente || null, id_usuario, total, metodo_pago || 'Efectivo']
    );

    const id_venta = ventaResult.insertId;

    for (let item of carrito) {
      const subtotalItem = item.cantidad * item.precio_venta;

      await connection.query(
        `INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unit, subtotal)
          VALUES (?, ?, ?, ?, ?)`,
        [id_venta, item.id, item.cantidad, item.precio_venta, subtotalItem]
      );

      await connection.query(
        `UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?`,
        [item.cantidad, item.id]
      );
    }

    await connection.commit(); 
    connection.release();      

    res.status(201).json({
      mensaje: 'Venta registrada con éxito',
      id_venta: id_venta,
      numero_factura: numero_factura
    });

  } catch (error) {
    await connection.rollback(); 
    connection.release();      
    console.error('Error al registrar la venta:', error);
    res.status(500).json({
      error: 'Error en el servidor al procesar la venta',
      detalle: error.message,
      codigo: error.code
    });
  }
};

// --- 2. FUNCIÓN PARA OBTENER VENTAS (DASHBOARD) ---
exports.obtenerVentas = async (req, res) => {
  try {
    const { inicio, fin } = req.query;
    let query = 'SELECT * FROM ventas';
    let params = [];

    if (inicio && fin) {
      query += ' WHERE DATE(created_at) BETWEEN ? AND ?';
      params.push(inicio, fin);
    }

    query += ' ORDER BY created_at DESC';

    const [ventas] = await db.query(query, params);
    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    res.status(500).json({
      error: 'Error de servidor al cargar ventas',
      detalle: error.message
    });
  }
};
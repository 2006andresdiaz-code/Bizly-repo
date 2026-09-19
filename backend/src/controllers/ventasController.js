// src/controllers/ventasController.js
const db = require('../config/db');

// --- 1. FUNCIÓN PARA CREAR VENTAS (Con Transacción Segura) ---
exports.crearVenta = async (req, res) => {
  const connection = await db.getConnection(); // Obtenemos una conexión exclusiva para la transacción
  try {
    await connection.beginTransaction(); // 1. Iniciamos la transacción

    const { id_cliente, id_usuario, total, metodo_pago, carrito } = req.body;

    // Validación básica
    if (!id_usuario || !total || !carrito || carrito.length === 0) {
      connection.release();
      return res.status(400).json({ error: 'Faltan campos obligatorios (id_usuario, total) o el carrito está vacío' });
    }

    // Insertamos la cabecera de la venta usando las columnas reales de tu tabla 'ventas'
    const [ventaResult] = await connection.query(
      `INSERT INTO ventas (id_cliente, id_usuario, total, metodo_pago)
        VALUES (?, ?, ?, ?)`,
      [id_cliente || null, id_usuario, total, metodo_pago || 'Efectivo']
    );

    const id_venta = ventaResult.insertId;

    // Recorremos el carrito para los detalles y el descuento de inventario
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

    await connection.commit(); // 2. Si todo salió perfecto, guardamos los cambios
    connection.release();      // Liberamos la conexión

    res.status(201).json({
      mensaje: 'Venta registrada con éxito',
      id_venta: id_venta
    });

  } catch (error) {
    await connection.rollback(); // 3. Si ocurre cualquier error, revertimos la operación
    connection.release();      // Liberamos la conexión
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
    const [ventas] = await db.query('SELECT * FROM ventas ORDER BY created_at DESC');
    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    res.status(500).json({
      error: 'Error de servidor al cargar ventas',
      detalle: error.message
    });
  }
};
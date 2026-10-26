// src/controllers/ventasController.js
const db = require('../config/db');

// --- 1. FUNCIÓN PARA CREAR VENTAS ---
exports.crearVenta = async (req, res) => {
  const connection = await db.getConnection(); 
  try {
    await connection.beginTransaction(); 

    const { id_cliente, id_usuario, total, metodo_pago, carrito } = req.body;

    if (!id_usuario || !total || !carrito || carrito.length === 0) {
      connection.release();
      return res.status(400).json({ error: 'Faltan campos obligatorios o el carrito está vacío' });
    }

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
    
    // Consultamos las ventas e incluimos dinámicamente todo lo que se ha devuelto de cada factura
    let query = `
      SELECT 
        v.*,
        COALESCE((SELECT SUM(monto_reembolso) FROM devoluciones d WHERE d.id_venta = v.id), 0) AS total_reembolsado
      FROM ventas v
    `;
    let params = [];

    if (inicio && fin) {
      query += ' WHERE DATE(v.created_at) BETWEEN ? AND ?';
      params.push(inicio, fin);
    }

    query += ' ORDER BY v.created_at DESC';

    const [ventas] = await db.query(query, params);

    // Ajustamos los datos antes de enviarlos al Dashboard
    const ventasNetas = ventas.map(v => {
      const totalLimpio = Number(v.total) - Number(v.total_reembolsado);
      return {
        ...v,
        total_original: v.total, // Conserva el dato original
        total: totalLimpio > 0 ? totalLimpio : 0 // Reemplaza "total" para que el Dashboard sume el ingreso real
      };
    });

    res.json(ventasNetas);
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    res.status(500).json({
      error: 'Error de servidor al cargar ventas',
      detalle: error.message
    });
  }
};

// --- 3. FUNCIÓN PARA DEVOLUCIONES (Bloquea duplicados) ---
exports.obtenerProductosPorFactura = async (req, res) => {
  const idFactura = req.params.id;

  try {
    const query = `
      SELECT 
        dv.id_producto, 
        p.nombre AS nombre_producto, 
        dv.cantidad AS cantidad_comprada, 
        p.precio_venta AS precio,
        COALESCE((SELECT SUM(cantidad) FROM devoluciones d WHERE d.id_venta = v.id AND d.id_producto = dv.id_producto), 0) AS cantidad_devuelta
      FROM detalle_ventas dv
      JOIN productos p ON dv.id_producto = p.id
      JOIN ventas v ON dv.id_venta = v.id
      WHERE v.numero_factura = ? OR v.id = ?
    `;

    const [productos] = await db.query(query, [idFactura, idFactura]);

    if (productos.length === 0) {
      return res.status(404).json({ mensaje: 'Factura no encontrada.' });
    }

    const productosDisponibles = productos.map(prod => {
      return {
        ...prod,
        cantidad: prod.cantidad_comprada - prod.cantidad_devuelta 
      };
    }).filter(prod => prod.cantidad > 0); 

    if (productosDisponibles.length === 0) {
      return res.status(400).json({ mensaje: 'Todos los productos de esta factura ya fueron devueltos.' });
    }

    res.json(productosDisponibles);

  } catch (error) {
    console.error('❌ ERROR SQL AL BUSCAR FACTURA:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalle: error.message 
    });
  }
};
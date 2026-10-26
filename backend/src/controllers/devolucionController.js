// src/controllers/devolucionController.js
const db = require('../config/db');

exports.crearDevolucion = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id_venta, id_producto, cantidad, motivo, monto_reembolso, dar_de_baja } = req.body;

    // 1. Buscamos el ID real de la venta
    const [ventas] = await connection.query(
      'SELECT id, numero_factura, id_cliente FROM ventas WHERE numero_factura = ? OR id = ?',
      [id_venta, id_venta]
    );

    if (ventas.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    const ventaRealId = ventas[0].id;
    const numeroFacturaVenta = ventas[0].numero_factura;
    const idCliente = ventas[0].id_cliente;

    // 2. Traer datos del cliente para la nueva factura
    let cliente = { nombre: 'Consumidor Final', documento: '', telefono: '', direccion: '' };
    if (idCliente) {
      const [clienteData] = await connection.query('SELECT nombre, apellido, documento, telefono, direccion FROM clientes WHERE id = ?', [idCliente]);
      if (clienteData.length > 0) {
        cliente = {
          nombre: `${clienteData[0].nombre} ${clienteData[0].apellido}`,
          documento: clienteData[0].documento,
          telefono: clienteData[0].telefono,
          direccion: clienteData[0].direccion
        };
      }
    }

    // 3. Guardamos la devolución
    const [devolucionResult] = await connection.query(
      `INSERT INTO devoluciones (id_venta, id_producto, id_usuario, cantidad, monto_reembolso, motivo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ventaRealId, id_producto, 1, cantidad, monto_reembolso, motivo]
    );
    const idDevolucion = devolucionResult.insertId;
    const numComprobante = String(idDevolucion).padStart(6, '0');

    // 4. Info del producto devuelto
    const [prodInfo] = await connection.query('SELECT stock_actual, nombre FROM productos WHERE id = ?', [id_producto]);
    const stockActual = prodInfo[0].stock_actual;
    const nombreProducto = prodInfo[0].nombre;
    let stockDespues = stockActual;

    // 5. Lógica de inventario (Baja vs Regreso)
    if (!dar_de_baja) {
      await connection.query('UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?', [cantidad, id_producto]);
      stockDespues = stockActual + Number(cantidad);
      await connection.query(
        `INSERT INTO movimientos_inventario (id_producto, id_usuario, tipo, cantidad, stock_antes, stock_despues, motivo, estado_producto)
         VALUES (?, ?, 'devolucion', ?, ?, ?, ?, 'Buen estado')`,
        [id_producto, 1, cantidad, stockActual, stockDespues, motivo]
      );
    } else {
      await connection.query(
        `INSERT INTO movimientos_inventario (id_producto, id_usuario, tipo, cantidad, stock_antes, stock_despues, motivo, estado_producto)
         VALUES (?, ?, 'ajuste', ?, ?, ?, ?, 'Dado de baja')`,
        [id_producto, 1, cantidad, stockActual, stockActual, 'Baja por Devolución: ' + motivo]
      );
    }

    // 6. Consultamos qué productos le quedan disponibles de esa factura
    const queryRestantes = `
      SELECT 
        p.nombre AS producto, 
        dv.cantidad AS comprada, 
        dv.precio_unit AS precio,
        COALESCE((SELECT SUM(d.cantidad) FROM devoluciones d WHERE d.id_venta = v.id AND d.id_producto = dv.id_producto), 0) AS devuelta
      FROM detalle_ventas dv
      JOIN productos p ON dv.id_producto = p.id
      JOIN ventas v ON dv.id_venta = v.id
      WHERE v.id = ?
    `;
    const [productosFactura] = await connection.query(queryRestantes, [ventaRealId]);
    
    const productosRestantes = productosFactura.map(p => ({
      nombre: p.producto,
      cantidad_restante: p.comprada - p.devuelta,
      precio: p.precio
    })).filter(p => p.cantidad_restante > 0);

    await connection.commit();
    connection.release();

    // 7. Armamos el ticket para el frontend
    res.status(201).json({ 
      mensaje: 'Devolución procesada con éxito',
      ticket: {
        num_comprobante: numComprobante,
        num_factura_origen: numeroFacturaVenta,
        fecha: new Date().toLocaleString(),
        cliente: cliente,
        item_devuelto: {
          nombre: nombreProducto,
          cantidad: cantidad,
          reembolso: monto_reembolso
        },
        items_restantes: productosRestantes
      }
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error al crear devolución:', error);
    res.status(500).json({ error: 'Error interno al procesar la devolución', detalle: error.message });
  }
};
// src/controllers/ventasController.js
const { db } = require('../db');
const { ventas, detalleVentas, productos, devoluciones } = require('../db/schema');
const { eq, or, desc, sql } = require('drizzle-orm');

// --- 1. FUNCIÓN PARA CREAR VENTAS (Transacción Atómica en Drizzle) ---
exports.crearVenta = async (req, res) => {
  try {
    const { id_cliente, id_usuario, total, metodo_pago, carrito } = req.body;

    if (!id_usuario || !total || !carrito || carrito.length === 0) {
      return res.status(400).json({ error: 'Faltan campos obligatorios o el carrito está vacío' });
    }

    const numero_factura = `FAC-${Date.now().toString().slice(-8)}`;

    const resultado = await db.transaction(async (tx) => {
      const metodoValido = (metodo_pago && ['efectivo', 'tarjeta', 'transferencia', 'nequi', 'daviplata'].includes(String(metodo_pago).toLowerCase()))
        ? String(metodo_pago).toLowerCase()
        : 'efectivo';

      const [ventaResult] = await tx.insert(ventas).values({
        numeroFactura: numero_factura,
        idCliente: id_cliente ? Number(id_cliente) : null,
        idVendedor: Number(id_usuario),
        subtotal: String(total),
        total: String(total),
        metodoPago: metodoValido,
        estado: 'completada',
      });

      const id_venta = ventaResult.insertId;

      for (let item of carrito) {
        const subtotalItem = Number(item.cantidad) * Number(item.precio_venta);

        await tx.insert(detalleVentas).values({
          idVenta: id_venta,
          idProducto: Number(item.id),
          cantidad: Number(item.cantidad),
          precioUnit: String(item.precio_venta),
          subtotal: String(subtotalItem),
        });

        await tx
          .update(productos)
          .set({
            stockActual: sql`${productos.stockActual} - ${Number(item.cantidad)}`,
          })
          .where(eq(productos.id, Number(item.id)));
      }

      return { id_venta, numero_factura };
    });

    res.status(201).json({
      mensaje: 'Venta registrada con éxito',
      id_venta: resultado.id_venta,
      numero_factura: resultado.numero_factura,
    });

  } catch (error) {
    console.error('Error al registrar la venta:', error);
    res.status(500).json({
      error: 'Error en el servidor al procesar la venta',
      detalle: error.message,
      codigo: error.code,
    });
  }
};

// --- 2. FUNCIÓN PARA OBTENER VENTAS (DASHBOARD) ---
exports.obtenerVentas = async (req, res) => {
  try {
    const { inicio, fin } = req.query;

    const baseQuery = db
      .select({
        id: ventas.id,
        id_cliente: ventas.idCliente,
        id_vendedor: ventas.idVendedor,
        numero_factura: ventas.numeroFactura,
        estado: ventas.estado,
        subtotal: ventas.subtotal,
        descuento: ventas.descuento,
        impuesto: ventas.impuesto,
        total: ventas.total,
        metodo_pago: ventas.metodoPago,
        observaciones: ventas.observaciones,
        anulada_por: ventas.anuladaPor,
        motivo_anulacion: ventas.motivoAnulacion,
        created_at: ventas.createdAt,
        updated_at: ventas.updatedAt,
        total_reembolsado: sql`COALESCE((SELECT SUM(${devoluciones.montoReembolsado}) FROM devoluciones WHERE devoluciones.id_venta = ${ventas.id}), 0)`.mapWith(Number),
      })
      .from(ventas);

    let whereClause = undefined;
    if (inicio && fin) {
      whereClause = sql`DATE(${ventas.createdAt}) BETWEEN ${inicio} AND ${fin}`;
    }

    const ventasRows = await (whereClause ? baseQuery.where(whereClause) : baseQuery).orderBy(desc(ventas.createdAt));

    // Ajustamos los datos antes de enviarlos al Dashboard
    const ventasNetas = ventasRows.map(v => {
      const totalLimpio = Number(v.total) - Number(v.total_reembolsado);
      return {
        ...v,
        total_original: v.total,
        total: totalLimpio > 0 ? totalLimpio : 0,
      };
    });

    res.json(ventasNetas);
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    res.status(500).json({
      error: 'Error de servidor al cargar ventas',
      detalle: error.message,
    });
  }
};

// --- 3. FUNCIÓN PARA DEVOLUCIONES (Bloquea duplicados y soporta FAC-000007 o ID) ---
exports.obtenerProductosPorFactura = async (req, res) => {
  const rawId = req.params.id.trim();
  const numericMatch = rawId.replace(/^FAC-/i, '');
  const idNumerico = /^\d+$/.test(numericMatch) ? Number(numericMatch) : null;

  try {
    const condiciones = [eq(ventas.numeroFactura, rawId)];
    if (idNumerico !== null) {
      condiciones.push(eq(ventas.id, idNumerico));
    }

    const productosRows = await db
      .select({
        id_producto: detalleVentas.idProducto,
        nombre_producto: productos.nombre,
        cantidad_comprada: detalleVentas.cantidad,
        precio: detalleVentas.precioUnit,
        cantidad_devuelta: sql`COALESCE((
          SELECT SUM(${devoluciones.cantidad}) 
          FROM devoluciones 
          WHERE devoluciones.id_venta = ${ventas.id} AND devoluciones.id_producto = ${detalleVentas.idProducto}
        ), 0)`.mapWith(Number),
      })
      .from(detalleVentas)
      .innerJoin(productos, eq(detalleVentas.idProducto, productos.id))
      .innerJoin(ventas, eq(detalleVentas.idVenta, ventas.id))
      .where(or(...condiciones));

    if (productosRows.length === 0) {
      return res.status(404).json({ mensaje: 'Factura no encontrada.' });
    }

    const productosDisponibles = productosRows
      .map(prod => ({
        ...prod,
        cantidad: Number(prod.cantidad_comprada) - Number(prod.cantidad_devuelta),
      }))
      .filter(prod => prod.cantidad > 0);

    if (productosDisponibles.length === 0) {
      return res.status(400).json({ mensaje: 'Todos los productos de esta factura ya fueron devueltos.' });
    }

    res.json(productosDisponibles);

  } catch (error) {
    console.error('❌ ERROR AL BUSCAR FACTURA:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalle: error.message,
    });
  }
};
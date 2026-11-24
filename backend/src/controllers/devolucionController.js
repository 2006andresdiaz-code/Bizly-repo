// src/controllers/devolucionController.js
const { db } = require('../db');
const { devoluciones, ventas, clientes, productos, detalleVentas, movimientosInventario } = require('../db/schema');
const { eq, or, desc, sql } = require('drizzle-orm');

// Obtener todas las devoluciones registradas
exports.obtenerDevoluciones = async (req, res) => {
  try {
    const rows = await db
      .select({
        id: devoluciones.id,
        id_venta: devoluciones.idVenta,
        id_producto: devoluciones.idProducto,
        id_usuario: devoluciones.idUsuario,
        cantidad: devoluciones.cantidad,
        motivo: devoluciones.motivo,
        estado: devoluciones.estado,
        monto_reembolsado: devoluciones.montoReembolsado,
        created_at: devoluciones.createdAt,
        updated_at: devoluciones.updatedAt,
      })
      .from(devoluciones)
      .orderBy(desc(devoluciones.id));

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener devoluciones:', error);
    res.status(500).json({
      error: 'Error interno al consultar las devoluciones',
      detalle: error.message,
    });
  }
};

// Procesar una nueva devolución (Transacción en Drizzle)
exports.crearDevolucion = async (req, res) => {
  try {
    const { id_venta, id_producto, id_usuario, cantidad, motivo, monto_reembolso, dar_de_baja } = req.body;
    const usuarioResponsable = id_usuario || 1;

    const resultado = await db.transaction(async (tx) => {
      // 1. Buscamos el ID real de la venta
      const condiciones = [eq(ventas.numeroFactura, String(id_venta))];
      if (/^\d+$/.test(String(id_venta))) {
        condiciones.push(eq(ventas.id, Number(id_venta)));
      }

      const ventaList = await tx
        .select({
          id: ventas.id,
          numero_factura: ventas.numeroFactura,
          id_cliente: ventas.idCliente,
        })
        .from(ventas)
        .where(or(...condiciones));

      if (ventaList.length === 0) {
        const notFoundError = new Error('VENTA_NO_ENCONTRADA');
        notFoundError.code = 'VENTA_NO_ENCONTRADA';
        throw notFoundError;
      }

      const ventaRealId = ventaList[0].id;
      const numeroFacturaVenta = ventaList[0].numero_factura;
      const idCliente = ventaList[0].id_cliente;

      // 2. Traer datos del cliente para la nueva factura
      let cliente = { nombre: 'Consumidor Final', documento: '', telefono: '', direccion: '' };
      if (idCliente) {
        const clienteData = await tx
          .select({
            nombre: clientes.nombre,
            apellido: clientes.apellido,
            documento: clientes.documento,
            telefono: clientes.telefono,
            direccion: clientes.direccion,
          })
          .from(clientes)
          .where(eq(clientes.id, idCliente));

        if (clienteData.length > 0) {
          cliente = {
            nombre: `${clienteData[0].nombre} ${clienteData[0].apellido}`,
            documento: clienteData[0].documento || '',
            telefono: clienteData[0].telefono || '',
            direccion: clienteData[0].direccion || '',
          };
        }
      }

      // 3. Guardamos la devolución
      const [devolucionResult] = await tx.insert(devoluciones).values({
        idVenta: ventaRealId,
        idProducto: Number(id_producto),
        idUsuario: Number(usuarioResponsable),
        cantidad: Number(cantidad),
        montoReembolsado: String(monto_reembolso || 0),
        motivo,
        estado: 'aprobada',
      });
      const idDevolucion = devolucionResult.insertId;
      const numComprobante = String(idDevolucion).padStart(6, '0');

      // 4. Info del producto devuelto
      const prodInfo = await tx
        .select({
          stock_actual: productos.stockActual,
          nombre: productos.nombre,
        })
        .from(productos)
        .where(eq(productos.id, Number(id_producto)));

      const stockActual = prodInfo[0]?.stock_actual || 0;
      const nombreProducto = prodInfo[0]?.nombre || '';
      let stockDespues = stockActual;

      // 5. Lógica de inventario (Baja vs Regreso)
      if (!dar_de_baja) {
        stockDespues = stockActual + Number(cantidad);
        await tx
          .update(productos)
          .set({ stockActual: stockDespues })
          .where(eq(productos.id, Number(id_producto)));

        await tx.insert(movimientosInventario).values({
          idProducto: Number(id_producto),
          idUsuario: Number(usuarioResponsable),
          tipoMovimiento: 'devolucion',
          cantidad: Number(cantidad),
          stockAnterior: Number(stockActual),
          stockNuevo: Number(stockDespues),
          motivo: motivo || 'Devolución de producto',
        });
      } else {
        await tx.insert(movimientosInventario).values({
          idProducto: Number(id_producto),
          idUsuario: Number(usuarioResponsable),
          tipoMovimiento: 'ajuste',
          cantidad: Number(cantidad),
          stockAnterior: Number(stockActual),
          stockNuevo: Number(stockActual),
          motivo: 'Baja por Devolución: ' + (motivo || ''),
        });
      }

      // 6. Consultamos qué productos le quedan disponibles de esa factura
      const productosFactura = await tx
        .select({
          producto: productos.nombre,
          comprada: detalleVentas.cantidad,
          precio: detalleVentas.precioUnit,
          devuelta: sql`COALESCE((
            SELECT SUM(${devoluciones.cantidad}) 
            FROM devoluciones 
            WHERE devoluciones.id_venta = ${ventas.id} AND devoluciones.id_producto = ${detalleVentas.idProducto}
          ), 0)`.mapWith(Number),
        })
        .from(detalleVentas)
        .innerJoin(productos, eq(detalleVentas.idProducto, productos.id))
        .innerJoin(ventas, eq(detalleVentas.idVenta, ventas.id))
        .where(eq(ventas.id, ventaRealId));

      const productosRestantes = productosFactura
        .map(p => ({
          nombre: p.producto,
          cantidad_restante: Number(p.comprada) - Number(p.devuelta),
          precio: p.precio,
        }))
        .filter(p => p.cantidad_restante > 0);

      return {
        numComprobante,
        numeroFacturaVenta,
        cliente,
        nombreProducto,
        cantidad,
        monto_reembolso,
        productosRestantes,
      };
    });

    res.status(201).json({
      mensaje: 'Devolución procesada con éxito',
      ticket: {
        num_comprobante: resultado.numComprobante,
        num_factura_origen: resultado.numeroFacturaVenta,
        fecha: new Date().toLocaleString(),
        cliente: resultado.cliente,
        item_devuelto: {
          nombre: resultado.nombreProducto,
          cantidad: resultado.cantidad,
          reembolso: resultado.monto_reembolso,
        },
        items_restantes: resultado.productosRestantes,
      },
    });

  } catch (error) {
    if (error.code === 'VENTA_NO_ENCONTRADA' || error.message === 'VENTA_NO_ENCONTRADA') {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    console.error('Error al crear devolución:', error);
    res.status(500).json({ error: 'Error interno al procesar la devolución', detalle: error.message });
  }
};
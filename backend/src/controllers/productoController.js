// src/controllers/productoController.js
const { db } = require('../db');
const { productos, categorias, proveedores } = require('../db/schema');
const { eq, and, ne, desc } = require('drizzle-orm');

// Obtener todos los productos
exports.obtenerProductos = async (req, res) => {
  try {
    const rows = await db
      .select({
        id: productos.id,
        id_categoria: productos.idCategoria,
        id_proveedor: productos.idProveedor,
        codigo: productos.codigo,
        nombre: productos.nombre,
        descripcion: productos.descripcion,
        precio_compra: productos.precioCompra,
        precio_venta: productos.precioVenta,
        stock_actual: productos.stockActual,
        stock_minimo: productos.stockMinimo,
        unidad_medida: productos.unidadMedida,
        numero_serie: productos.numeroSerie,
        tipo_control: productos.tipoControl,
        ficha_tecnica: productos.fichaTecnica,
        created_by: productos.createdBy,
        activo: productos.activo,
        created_at: productos.createdAt,
        categoria: categorias.nombre,
        proveedor: proveedores.nombre,
      })
      .from(productos)
      .leftJoin(categorias, eq(productos.idCategoria, categorias.id))
      .leftJoin(proveedores, eq(productos.idProveedor, proveedores.id))
      .where(eq(productos.activo, 1))
      .orderBy(desc(productos.id));

    // Parsear la ficha técnica de JSON a Objeto para el frontend
    const productosFormateados = rows.map(prod => ({
      ...prod,
      ficha_tecnica: typeof prod.ficha_tecnica === 'string'
        ? JSON.parse(prod.ficha_tecnica)
        : prod.ficha_tecnica || {}
    }));

    res.json(productosFormateados);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener productos' });
  }
};

// Crear producto con caracterización técnica
exports.crearProducto = async (req, res) => {
  let {
    id_categoria, id_proveedor = null, codigo, nombre, descripcion = null,
    precio_compra, precio_venta, stock_actual, stock_minimo,
    unidad_medida = 'unidad', numero_serie = null, tipo_control = 'ESTANDAR',
    ficha_tecnica = null, id_usuario = null
  } = req.body;

  // SANITIZACIÓN: Si envían campos vacíos (''), los convertimos a números seguros
  precio_compra = precio_compra === '' || precio_compra == null ? 0 : Number(precio_compra);
  precio_venta = precio_venta === '' || precio_venta == null ? 0 : Number(precio_venta);
  stock_actual = stock_actual === '' || stock_actual == null ? 0 : Number(stock_actual);
  stock_minimo = stock_minimo === '' || stock_minimo == null ? 5 : Number(stock_minimo);
  id_proveedor = id_proveedor === '' ? null : id_proveedor;

  if (!id_categoria || !codigo || !nombre || precio_venta === undefined) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: id_categoria, codigo, nombre o precio_venta' });
  }

  try {
    const existente = await db
      .select({ id: productos.id })
      .from(productos)
      .where(eq(productos.codigo, codigo));

    if (existente.length > 0) {
      return res.status(400).json({ error: 'El código de producto ya está registrado' });
    }

    const [result] = await db.insert(productos).values({
      idCategoria: id_categoria ? Number(id_categoria) : null,
      idProveedor: id_proveedor ? Number(id_proveedor) : null,
      codigo,
      nombre,
      descripcion: descripcion || null,
      precioCompra: String(precio_compra),
      precioVenta: String(precio_venta),
      stockActual: Number(stock_actual),
      stockMinimo: Number(stock_minimo),
      unidadMedida: unidad_medida || 'unidad',
      numeroSerie: numero_serie || null,
      tipoControl: tipo_control || 'ESTANDAR',
      fichaTecnica: ficha_tecnica ? JSON.stringify(ficha_tecnica) : null,
      createdBy: id_usuario ? Number(id_usuario) : null,
      activo: 1,
    });

    res.status(201).json({ mensaje: 'Producto creado exitosamente', id: result.insertId });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al registrar el producto' });
  }
};

// Actualizar producto
exports.actualizarProducto = async (req, res) => {
  const { id } = req.params;
  let {
    id_categoria, id_proveedor = null, codigo, nombre, descripcion = null,
    precio_compra, precio_venta, stock_actual, stock_minimo,
    unidad_medida = 'unidad', numero_serie = null, tipo_control = 'ESTANDAR',
    ficha_tecnica = null
  } = req.body;

  // SANITIZACIÓN para evitar el mismo error al actualizar
  precio_compra = precio_compra === '' || precio_compra == null ? 0 : Number(precio_compra);
  precio_venta = precio_venta === '' || precio_venta == null ? 0 : Number(precio_venta);
  stock_actual = stock_actual === '' || stock_actual == null ? 0 : Number(stock_actual);
  stock_minimo = stock_minimo === '' || stock_minimo == null ? 5 : Number(stock_minimo);
  id_proveedor = id_proveedor === '' ? null : id_proveedor;

  try {
    const existente = await db
      .select({ id: productos.id })
      .from(productos)
      .where(and(eq(productos.codigo, codigo), ne(productos.id, Number(id))));

    if (existente.length > 0) {
      return res.status(400).json({ error: 'El código ya pertenece a otro producto' });
    }

    const [result] = await db
      .update(productos)
      .set({
        idCategoria: id_categoria ? Number(id_categoria) : null,
        idProveedor: id_proveedor ? Number(id_proveedor) : null,
        codigo,
        nombre,
        descripcion: descripcion || null,
        precioCompra: String(precio_compra),
        precioVenta: String(precio_venta),
        stockActual: Number(stock_actual),
        stockMinimo: Number(stock_minimo),
        unidadMedida: unidad_medida || 'unidad',
        numeroSerie: numero_serie || null,
        tipoControl: tipo_control || 'ESTANDAR',
        fichaTecnica: ficha_tecnica ? JSON.stringify(ficha_tecnica) : null,
      })
      .where(eq(productos.id, Number(id)));

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado para actualizar' });
    }

    res.json({ mensaje: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

// Eliminar producto (Soft Delete)
exports.eliminarProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db
      .update(productos)
      .set({ activo: 0 })
      .where(eq(productos.id, Number(id)));

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto desactivado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno al desactivar el producto' });
  }
};
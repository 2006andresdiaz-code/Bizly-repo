// src/controllers/productoController.js
const db = require('../config/db');

// Obtener todos los productos
exports.obtenerProductos = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.nombre AS categoria, pr.nombre AS proveedor
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id
      LEFT JOIN proveedores pr ON p.id_proveedor = pr.id
      WHERE p.activo = 1
      ORDER BY p.id DESC
    `);

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
  // Usamos let para poder modificar los valores si vienen vacíos
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
    const [existente] = await db.query('SELECT id FROM productos WHERE codigo = ?', [codigo]);
    if (existente.length > 0) {
      return res.status(400).json({ error: 'El código de producto ya está registrado' });
    }

    const [result] = await db.query(
      `INSERT INTO productos 
       (id_categoria, id_proveedor, codigo, nombre, descripcion, precio_compra, precio_venta, stock_actual, stock_minimo, unidad_medida, numero_serie, tipo_control, ficha_tecnica, created_by, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        id_categoria, id_proveedor, codigo, nombre, descripcion, precio_compra, precio_venta,
        stock_actual, stock_minimo, unidad_medida, numero_serie, tipo_control,
        ficha_tecnica ? JSON.stringify(ficha_tecnica) : null, id_usuario
      ]
    );

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
    const [existente] = await db.query('SELECT id FROM productos WHERE codigo = ? AND id != ?', [codigo, id]);
    if (existente.length > 0) {
      return res.status(400).json({ error: 'El código ya pertenece a otro producto' });
    }

    const [result] = await db.query(
      `UPDATE productos 
       SET id_categoria = ?, id_proveedor = ?, codigo = ?, nombre = ?, descripcion = ?, 
           precio_compra = ?, precio_venta = ?, stock_actual = ?, stock_minimo = ?, 
           unidad_medida = ?, numero_serie = ?, tipo_control = ?, ficha_tecnica = ?
       WHERE id = ?`,
      [
        id_categoria, id_proveedor, codigo, nombre, descripcion, precio_compra, precio_venta,
        stock_actual, stock_minimo, unidad_medida, numero_serie, tipo_control,
        ficha_tecnica ? JSON.stringify(ficha_tecnica) : null, id
      ]
    );

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
    const [result] = await db.query('UPDATE productos SET activo = 0 WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto desactivado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno al desactivar el producto' });
  }
};
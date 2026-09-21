// src/controllers/productoController.js
const db = require('../config/db');

// Función para obtener todos los productos activos
exports.obtenerProductos = async (req, res) => {
  try {
    const [productos] = await db.query('SELECT * FROM productos WHERE activo = 1');
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener el inventario:', error);
    res.status(500).json({ error: 'Error de servidor al cargar productos', detalle: error.message });
  }
};

// Función para crear productos
exports.crearProducto = async (req, res) => {
  try {
    const { nombre, codigo, id_categoria, precio_venta, stock_actual, stock_minimo, id_proveedor, id_usuario } = req.body;

    if (!nombre || !codigo || !id_categoria || precio_venta === undefined || stock_actual === undefined) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, codigo, id_categoria, precio_venta, stock_actual)' });
    }

    const [result] = await db.query(
      `INSERT INTO productos 
      (nombre, codigo, id_categoria, precio_venta, stock_actual, stock_minimo, id_proveedor, created_by, activo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        nombre,
        codigo,
        id_categoria,
        precio_venta,
        stock_actual,
        stock_minimo !== undefined ? stock_minimo : 5,
        id_proveedor || null,
        id_usuario || null
      ]
    );

    res.status(201).json({
      mensaje: 'Producto creado con éxito',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      error: 'Error interno del servidor al guardar',
      detalle: error.message,
      codigo: error.code
    });
  }
};

// Actualizar producto en MySQL
exports.actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, codigo, id_categoria, precio_venta, stock_actual } = req.body;
  try {
    const query = 'UPDATE productos SET nombre = ?, codigo = ?, id_categoria = ?, precio_venta = ?, stock_actual = ? WHERE id = ?';
    await db.query(query, [nombre, codigo, id_categoria, precio_venta, stock_actual, id]);
    res.json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error interno al actualizar el producto' });
  }
};

// Desactivar producto en MySQL (Soft Delete)
exports.eliminarProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'UPDATE productos SET activo = 0 WHERE id = ?';
    await db.query(query, [id]);
    res.json({ message: 'Producto desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar producto:', error);
    res.status(500).json({ error: 'Error interno al desactivar el producto' });
  }
};
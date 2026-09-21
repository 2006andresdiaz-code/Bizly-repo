// src/routes/productoRoutes.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Ruta GET para obtener productos (Protegida)
router.get('/', verificarToken, productoController.obtenerProductos);

// Ruta POST para crear un nuevo producto (Protegida con token)
router.post('/', verificarToken, productoController.crearProducto);

// NUEVO: Ruta PUT para actualizar un producto existente
router.put('/:id', verificarToken, productoController.actualizarProducto);

// NUEVO: Ruta DELETE para desactivar/eliminar un producto
router.delete('/:id', verificarToken, productoController.eliminarProducto);

module.exports = router;
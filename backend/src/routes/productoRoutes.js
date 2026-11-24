// src/routes/productoRoutes.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, productoController.obtenerProductos);
router.post('/', verificarToken, productoController.crearProducto);
router.put('/:id', verificarToken, productoController.actualizarProducto);
router.delete('/:id', verificarToken, productoController.eliminarProducto);

module.exports = router;
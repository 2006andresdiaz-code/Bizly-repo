// src/routes/productoRoutes.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Ruta GET para obtener productos (Protegida)
router.get('/', verificarToken, productoController.obtenerProductos);

// Ruta POST para crear un nuevo producto (Protegida con token)
router.post('/', verificarToken, productoController.crearProducto);

module.exports = router;
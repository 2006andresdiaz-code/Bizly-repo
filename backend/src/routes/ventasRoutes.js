// src/routes/ventasRoutes.js
const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Rutas protegidas con el middleware JWT
router.post('/', verificarToken, ventasController.crearVenta);
router.get('/', verificarToken, ventasController.obtenerVentas);

// Nueva ruta para devoluciones (Sin verificarToken para que funcione directo con tu componente Devolucion.jsx)
router.get('/:id/productos', ventasController.obtenerProductosPorFactura);

module.exports = router;
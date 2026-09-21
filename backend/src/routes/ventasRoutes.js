// src/routes/ventasRoutes.js
const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Rutas protegidas con el middleware JWT
router.post('/', verificarToken, ventasController.crearVenta);
router.get('/', verificarToken, ventasController.obtenerVentas);

module.exports = router;
// src/routes/devolucionRoutes.js
const express = require('express');
const router = express.Router();
const devolucionController = require('../controllers/devolucionController');

// Ruta POST para procesar la devolución
router.post('/', devolucionController.crearDevolucion);

module.exports = router;
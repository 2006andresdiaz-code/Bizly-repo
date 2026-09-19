// backend/src/routes/auditoriaRoutes.js
const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoriaController');

// Ruta GET para listar la auditoría conectada a la base de datos
router.get('/', auditoriaController.obtenerAuditoria);

module.exports = router;
// backend/src/routes/auditoriaRoutes.js
const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoriaController');
const { verificarToken } = require('../middlewares/authMiddleware'); // <-- OJO: Ahora con llaves

// Agregamos verificarToken como guardia de la ruta
router.get('/', verificarToken, auditoriaController.obtenerAuditoria);

module.exports = router;
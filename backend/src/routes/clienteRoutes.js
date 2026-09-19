// src/routes/clienteRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerClientes, crearCliente } = require('../controllers/clienteController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Ruta para obtener la lista de clientes: GET / (Puede ser pública o requerir token)
router.get('/', verificarToken, obtenerClientes);

// Ruta para registrar un nuevo cliente: POST / (Protegida con token)
router.post('/', verificarToken, crearCliente);

module.exports = router;
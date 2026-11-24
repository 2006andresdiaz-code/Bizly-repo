const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para el inicio de sesión
router.post('/login', authController.login);

// Ruta para registrar un nuevo usuario (POST)
router.post('/registro', authController.registrar);

// Ruta para obtener la lista de usuarios (GET)
router.get('/usuarios', authController.obtenerUsuarios);

// Rutas para recuperación de contraseña
router.post('/recuperar', authController.solicitarRecuperacion);
router.post('/restablecer', authController.restablecerPassword);

module.exports = router;
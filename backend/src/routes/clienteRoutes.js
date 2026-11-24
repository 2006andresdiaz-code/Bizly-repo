const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verificarToken } = require('../middlewares/authMiddleware'); // O como se llame tu middleware de seguridad

router.get('/', verificarToken, clienteController.obtenerClientes);
router.post('/', verificarToken, clienteController.crearCliente);

// ESTAS RUTAS SON LAS NUEVAS QUE AHORA SÍ FUNCIONARÁN:
router.put('/:id', verificarToken, clienteController.actualizarCliente);
router.patch('/:id/desactivar', verificarToken, clienteController.desactivarCliente);
router.patch('/:id/reactivar', verificarToken, clienteController.reactivarCliente);

module.exports = router;
const express = require('express');
const controller = require('../controllers/envios.controller');
const router = express.Router();

router.get('/activos', controller.obtenerEnviosActivos);
router.post('/', controller.crearEnvio);
router.get('/', controller.obtenerEnvios);
router.get('/:id', controller.obtenerEnvioPorId);
router.put('/:id', controller.actualizarEnvio);
router.patch('/:id/estado', controller.actualizarEstado);
router.delete('/:id', controller.eliminarEnvio);

module.exports = router;
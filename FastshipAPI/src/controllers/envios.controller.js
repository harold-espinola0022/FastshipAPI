const Envio = require('../models/Envio');
const CAMPOS_CREAR = ['pedidoId', 'remitente', 'destinatario', 'direccionEntrega', 'estado'];
const CAMPOS_ACTUALIZAR = ['remitente', 'destinatario', 'direccionEntrega', 'estado'];

function filtrarCampos(body, permitidos) {
  const datos = {};
  for (const campo of permitidos) {
    if (body[campo] !== undefined) datos[campo] = body[campo];
  }
  return datos;
}

function normalizarId(id) {
  return String(id).trim().toUpperCase();
}

function manejarError(res, error) {
  if (error.name === 'ValidationError') {
    const errores = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ ok: false, mensaje: 'Datos inválidos', errores });
  }
  if (error.code === 11000) {
    return res.status(409).json({ ok: false, mensaje: 'Ya existe un envío con ese ID de pedido' });
  }
  console.error(error);
  return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
}

async function crearEnvio(req, res) {
  try {
    const datos = filtrarCampos(req.body, CAMPOS_CREAR);
    const envio = await Envio.create(datos);
    res.status(201).json({ ok: true, mensaje: 'Envío registrado', data: envio });
  } catch (error) {
    manejarError(res, error);
  }
}

async function obtenerEnvios(req, res) {
  try {
    const envios = await Envio.find().sort({ createdAt: -1 });
    res.json({ ok: true, total: envios.length, data: envios });
  } catch (error) {
    manejarError(res, error);
  }
}

async function obtenerEnviosActivos(req, res) {
  try {
    const envios = await Envio.find({ estado: { $ne: 'entregado' } }).sort({ createdAt: -1 });
    res.json({ ok: true, total: envios.length, data: envios });
  } catch (error) {
    manejarError(res, error);
  }
}

async function obtenerEnvioPorId(req, res) {
  try {
    const envio = await Envio.findOne({ pedidoId: normalizarId(req.params.id) });
    if (!envio) {
      return res.status(404).json({ ok: false, mensaje: 'Envío no encontrado' });
    }
    res.json({ ok: true, data: envio });
  } catch (error) {
    manejarError(res, error);
  }
}

async function actualizarEstado(req, res) {
  try {
    const { estado } = req.body;
    if (!estado) {
      return res.status(400).json({ ok: false, mensaje: 'Debes enviar el campo "estado"' });
    }
    const envio = await Envio.findOneAndUpdate(
      { pedidoId: normalizarId(req.params.id) },
      { estado },
      { new: true, runValidators: true }
    );
    if (!envio) {
      return res.status(404).json({ ok: false, mensaje: 'Envío no encontrado' });
    }
    res.json({ ok: true, mensaje: 'Estado actualizado', data: envio });
  } catch (error) {
    manejarError(res, error);
  }
}

async function actualizarEnvio(req, res) {
  try {
    const datos = filtrarCampos(req.body, CAMPOS_ACTUALIZAR);
    if (Object.keys(datos).length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'No se enviaron campos para actualizar' });
    }
    const envio = await Envio.findOneAndUpdate(
      { pedidoId: normalizarId(req.params.id) },
      datos,
      { new: true, runValidators: true }
    );
    if (!envio) {
      return res.status(404).json({ ok: false, mensaje: 'Envío no encontrado' });
    }
    res.json({ ok: true, mensaje: 'Envío actualizado', data: envio });
  } catch (error) {
    manejarError(res, error);
  }
}

async function eliminarEnvio(req, res) {
  try {
    const envio = await Envio.findOneAndDelete({ pedidoId: normalizarId(req.params.id) });
    if (!envio) {
      return res.status(404).json({ ok: false, mensaje: 'Envío no encontrado' });
    }
    res.json({ ok: true, mensaje: 'Envío eliminado' });
  } catch (error) {
    manejarError(res, error);
  }
}
module.exports = {crearEnvio, obtenerEnvios, obtenerEnviosActivos, obtenerEnvioPorId, actualizarEstado, actualizarEnvio, eliminarEnvio};
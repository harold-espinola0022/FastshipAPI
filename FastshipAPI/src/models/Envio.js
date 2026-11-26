const mongoose = require('mongoose');
const ESTADOS = ['pendiente', 'en_transito', 'entregado'];

const envioSchema = new mongoose.Schema(
  {pedidoId: {type: String, required: [true, 'El ID del pedido es obligatorio'], unique: true, trim: true, uppercase: true},
  remitente: {type: String, required: [true, 'El remitente es obligatorio'], trim: true, minlength: [3, 'El remitente debe tener al menos 3 caracteres']},
  destinatario: {type: String, required: [true, 'El destinatario es obligatorio'], trim: true, minlength: [3, 'El destinatario debe tener al menos 3 caracteres']},
  direccionEntrega: {type: String, required: [true, 'La dirección de entrega es obligatoria'], trim: true, minlength: [5, 'La dirección debe tener al menos 5 caracteres']},
  estado: {type: String, enum: {values: ESTADOS, message: 'Estado inválido. Usa: pendiente, en_transito o entregado'}, default: 'pendiente'}},
  {timestamps: true}
);

module.exports = mongoose.model('Envio', envioSchema);
module.exports.ESTADOS = ESTADOS;
const mongoose = require('mongoose');
const { Schema } = mongoose;

const CopiaSchema = new Schema({
  funcionario: String,
  status: String,
  fecha: { type: Date, default: Date.now }
}, { _id: true });

const BitacoraSchema = new Schema({
  user: String,
  descripcion: String,
  importancia: String,
  fecha: { type: Date, default: Date.now }
}, { _id: true });

const TurnadoSchema = new Schema({
  instruccion: String,
  areaDestino: String,
  dirigido: String,
  prioridad: String,
  fechaTurnado: { type: Date, default: Date.now },
  compromiso: Date,
  turna: String,
  notas: String,
  status: String
}, { _id: true });

const OficioSchema = new Schema({

  folio: { type: String, required: true, unique: true },
  tipo: String,
  fecha: { type: Date, default: Date.now },

  area: String,
  asunto: String,
  dirigido: String,
  generado: String,

  relacionados: [String],

  turnados: [TurnadoSchema],
  copias: [CopiaSchema],
  bitacora: [BitacoraSchema],

  status: String,

}, { timestamps: true });

module.exports = mongoose.model('Oficio', OficioSchema);
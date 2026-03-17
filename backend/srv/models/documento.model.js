import mongoose, { model } from 'mongoose';

const { Schema } = mongoose;


const AnexoSchema = new Schema({
  registrador: String,
  mensaje: String,
  ruta: String,
  nombre: String,
  confidencial: { type: Boolean, default: false },
  fecha: { type: Date, default: Date.now }
}, { _id: true });

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

const RespuestaSchema = new Schema({
  mensaje: String,
  nombre: String,
  anexos: [String],
  fecha: { type: Date, default: Date.now }
}, { _id: true });

const TurnadoSchema = new Schema({
  instruccion: String,
  remitente: String,
  areaDestino: String,
  dirigido: String,
  prioridad: String,
  fechaTurnado: { type: Date, default: Date.now },
  compromiso: Date,
  turna: String,
  notas: String,
  status: String
}, { _id: true });


const DocumentoSchema = new Schema({

  folio: {type: String, required: true, unique: true},
  docId: { type: String, required: true, index: true },
  ejercicio: String,

  fechaDoc: Date,
  acuse: Date,
  registro: { type: Date, default: Date.now },

  completa: { type: Boolean, default: false },
  interno: { type: Boolean, default: false },
  status: String,

  remitente: String,
  tipo: String,
  tema: String,
  secundario: String,
  adicional: String,
  asunto: String,
  observaciones: String,

  relacionados: [String],

  anexos: [AnexoSchema],
  turnados: [TurnadoSchema],
  copias: [CopiaSchema],
  bitacora: [BitacoraSchema],
  respuestas: [RespuestaSchema],

  eliminado: { type: Boolean, default: false },
  motivoEliminado: String

}, { timestamps: true });

export default model('Documento', DocumentoSchema);
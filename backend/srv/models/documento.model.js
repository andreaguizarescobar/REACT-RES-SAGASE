import mongoose, { model } from 'mongoose';

const { Schema } = mongoose;


const AnexoSchema = new Schema({
  registrador: {type: Schema.Types.ObjectId, ref: 'User'},
  mensaje: String,
  ruta: String,
  nombre: String,
  confidencial: { type: Boolean, default: false },
  fecha: { type: Date, default: Date.now }
}, { _id: true });

const CopiaSchema = new Schema({
  funcionario: {type: Schema.Types.ObjectId, ref: 'User'},
  status: String,
  fecha: { type: Date, default: Date.now }
}, { _id: true });

const BitacoraSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
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
  instruccion: {type: Schema.Types.ObjectId, ref: 'Instruccion'},
  remitente: {type: Schema.Types.ObjectId, ref: 'Remitentes'},
  areaDestino: {type: Schema.Types.ObjectId, ref: 'Area'},
  dirigido: {type: Schema.Types.ObjectId, ref: 'User'},
  prioridad: String,
  fechaTurnado: { type: Date, default: Date.now },
  compromiso: Date,
  turna: {type: Schema.Types.ObjectId, ref: 'User'},
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

  remitente: {type: Schema.Types.ObjectId, ref: 'Remitentes'},
  tipo: {type: Schema.Types.ObjectId, ref: 'TipoDocumento'},
  tema: {type: Schema.Types.ObjectId, ref: 'TemaPrincipal'},
  secundario: {type: Schema.Types.ObjectId, ref: 'TemaPrincipal'},
  adicional: {type: Schema.Types.ObjectId, ref: 'Adicional'},
  asunto: String,
  observaciones: String,

  relacionados: [{type: Schema.Types.ObjectId, ref: 'Oficio'},
    {type: Schema.Types.ObjectId, ref: 'Documento'},
  ],

  anexos: [AnexoSchema],
  turnados: [TurnadoSchema],
  copias: [CopiaSchema],
  bitacora: [BitacoraSchema],
  respuestas: [RespuestaSchema],

  eliminado: { type: Boolean, default: false },
  motivoEliminado: String

}, { timestamps: true });

export default model('Documento', DocumentoSchema);
import mongoose, { model } from 'mongoose';

const { Schema } = mongoose;


const AnexoSchema = new Schema({
  registrador: {type: Schema.Types.ObjectId, ref: 'users'},
  mensaje: String,
  ruta: String,
  nombre: String,
  confidencial: { type: Boolean, default: false },
  fecha: { type: Date, default: Date.now }
}, { _id: true });

const CopiaSchema = new Schema({
  funcionario: {type: Schema.Types.ObjectId, ref: 'users'},
  status: { type: String, default: "Por leer" },
  fecha: { type: Date, default: Date.now }
}, { _id: true });

const BitacoraSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'users'},
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
  dirigido: {type: Schema.Types.ObjectId, ref: 'users'},
  prioridad: String,
  fechaTurnado: { type: Date, default: Date.now },
  compromiso: Date,
  turna: {type: Schema.Types.ObjectId, ref: 'users'},
  notas: String,
  status: String
}, { _id: true });

const AdicionalSchema = new Schema({
  tipo: String,
  descripcion: String,
  registrador: {type: Schema.Types.ObjectId, ref: 'users'},
}, { timestamps: true });


const DocumentoSchema = new Schema({

  folio: {type: String, required: true, unique: true},
  docId: { type: String, required: true, index: true },
  ejercicio: String,

  fechaDoc: Date,
  acuse: Date,
  registro: { type: Date, default: Date.now },

  completa: { type: Boolean, default: true },
  interno: { type: Boolean, default: true },
  status: {type: String, default: "Sin instrucciones"},

  remitente: {type: Schema.Types.ObjectId, ref: 'Remitentes'},
  tipo: {type: Schema.Types.ObjectId, ref: 'TipoDocumento'},
  tema: {type: Schema.Types.ObjectId, ref: 'TemaPrincipal'},
  secundario: {type: Schema.Types.ObjectId, ref: 'TemaPrincipal'},
  adicional: [AdicionalSchema],
  asunto: String,
  observaciones: String,

  relacionados: [
    {
      item: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'relacionados.modelo'
      },
      modelo: {
        type: String,
        required: true,
        enum: ['Oficio', 'Documento']
      }
    }
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
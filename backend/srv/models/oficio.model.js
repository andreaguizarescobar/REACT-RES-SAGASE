import mongoose, { model } from 'mongoose';

const { Schema } = mongoose;

const OficioSchema = new Schema({
  folio: { type: String, required: true, unique: true },
  tipo: String,
  fecha: { type: Date, default: Date.now },
  fechaTexto: String,

  asunto: String,
  contenido: String,
  dirigido: String,
  generado: String,
  ccp: String,

  plantillaId: { type: Schema.Types.ObjectId, ref: 'Fondo' },
  remitenteId: { type: Schema.Types.ObjectId, ref: 'Remitentes' },
  destinatarioId: { type: Schema.Types.ObjectId, ref: 'Remitentes' },
  creadoPor: { type: Schema.Types.ObjectId, ref: 'users' },

  status: { type: String, default: 'generado' },
}, { timestamps: true });

export default model('Oficio', OficioSchema);
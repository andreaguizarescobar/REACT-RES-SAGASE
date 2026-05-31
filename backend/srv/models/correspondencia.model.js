import { Schema, model } from 'mongoose';

const CorrespondenciaSchema = new Schema({
  fecha: Date,
  folio: { type: String, unique: true },
  importancia: String,
  entregaMax: Date,
  justificacion: String,
  soporte: String,
  area: {type: Schema.Types.ObjectId, ref: 'Area' },
  oficio: String,
  asunto: String,
  doc: {type: Schema.Types.ObjectId, ref: 'Documento' },
  remitente: {type: Schema.Types.ObjectId, ref: 'Remitentes' },
  destinatario: { type: Schema.Types.ObjectId, ref: 'Remitentes' },
  anexos: [String],
  mensajero: String,
  guia: String,
  adjunto: String,
  status: { type: String, default: 'registrado' },
}, { timestamps: true });

export default model('Correspondencia', CorrespondenciaSchema);
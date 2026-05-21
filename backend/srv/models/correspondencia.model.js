import { Schema, model } from 'mongoose';

const CorrespondenciaSchema = new Schema({
  fecha: Date,
  folio: { type: String, unique: true },
  importancia: String,
  entregaMax: Date,
  justificacion: String,
  soporte: String,
  area: {type: Schema.Types.ObjectId, ref: 'Areas' },
  oficio: String,
  asunto: String,
  doc: {type: Schema.Types.ObjectId, ref: 'Documentos' },
  remitente: {type: Schema.Types.ObjectId, ref: 'Remitentes' },
  destinatario: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
  anexos: [String],
  mensajero: String,
  guia: String,
  adjunto: String,
  status: String
}, { timestamps: true });

export default model('Correspondencia', CorrespondenciaSchema);
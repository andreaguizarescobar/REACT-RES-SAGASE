import { Schema, model } from 'mongoose';

const CorrespondenciaSchema = new Schema({
  fecha: Date,
  folio: { type: String, unique: true },
  importancia: String,
  entregaMax: Date,
  justificacion: String,
  soporte: String,
  area: String,
  oficio: String,
  asunto: String,
  folio2: String,
  doc: String,
  remitente: String,
  destinatario: String,
  anexos: String,
  mensajero: String,
  guia: String,
  adjunto: String,
  status: String
}, { timestamps: true });

export default model('Correspondencia', CorrespondenciaSchema);
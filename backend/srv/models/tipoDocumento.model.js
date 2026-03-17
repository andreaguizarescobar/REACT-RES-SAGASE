import { Schema, model } from 'mongoose';

const TipoDocumentoSchema = new Schema({
  tipo: String,
  historico: Boolean
}, { timestamps: true });

export default model('TipoDocumento', TipoDocumentoSchema);
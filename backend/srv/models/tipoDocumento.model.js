import { Schema, model } from 'mongoose';

const TipoDocumentoSchema = new Schema({
  tipo: {type: String, required: true, unique: true, index: true, trim: true,},
  historico: Boolean
}, { timestamps: true });

export default model('TipoDocumento', TipoDocumentoSchema);
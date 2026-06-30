import { Schema, model } from 'mongoose';

const TipoDocumentoSchema = new Schema({
  tipo: {type: String, required: true, unique: true, index: true, trim: true,},
  activo: { type: Boolean, default: true },
}, { timestamps: true });

export default model('TipoDocumento', TipoDocumentoSchema);
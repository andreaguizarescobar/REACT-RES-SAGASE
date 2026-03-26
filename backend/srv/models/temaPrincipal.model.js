import { Schema, model } from 'mongoose';

const TemaPrincipalSchema = new Schema({
  descripcion: {type: String, required: true, unique: true, index: true, trim: true,},
  validacion: Boolean,
  historico: Boolean
}, { timestamps: true });

export default model('TemaPrincipal', TemaPrincipalSchema);
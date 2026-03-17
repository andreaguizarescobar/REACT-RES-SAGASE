import { Schema, model } from 'mongoose';

const TemaPrincipalSchema = new Schema({
  descripcion: String,
  validacion: Boolean,
  historico: Boolean
}, { timestamps: true });

export default model('TemaPrincipal', TemaPrincipalSchema);
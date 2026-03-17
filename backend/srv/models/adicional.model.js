import { Schema, model } from 'mongoose';

const AdicionalSchema = new Schema({
  descripcion: String,
  historico: Boolean
}, { timestamps: true });

export default model('Adicional', AdicionalSchema);
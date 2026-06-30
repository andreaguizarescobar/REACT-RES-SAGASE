import { Schema, model } from 'mongoose';

const TemaPrincipalSchema = new Schema({
  descripcion: {type: String, required: true, unique: true, index: true, trim: true,},
  activo: { type: Boolean, default: true },
}, { timestamps: true });

export default model('TemaPrincipal', TemaPrincipalSchema);
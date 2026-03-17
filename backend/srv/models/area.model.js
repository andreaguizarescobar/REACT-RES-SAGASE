import { Schema, model } from 'mongoose';

const AreaSchema = new Schema({
  clave: { type: String, required: true, unique: true },
  nombre: String,
  abreviatura: String,
  direccion: Boolean,
  pertenece: String
}, { timestamps: true });

export default model('Area', AreaSchema);
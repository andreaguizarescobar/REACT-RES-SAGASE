import { Schema, model } from 'mongoose';

const FondoSchema = new Schema({
  nombre: String,
  abreviatura: String,
  encabezado: String,
  pie: String,
  fondo: String,
  activo: { type: Boolean, default: true },
}, { timestamps: true });

export default model('Fondo', FondoSchema);
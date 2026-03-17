import { Schema, model } from 'mongoose';

const FondoSchema = new Schema({
  nombre: String,
  abreviatura: String,
  direccion: String,
  correo: String,
  telefono: String,
  encabezado: String,
  pie: String,
  fondo: String
}, { timestamps: true });

export default model('Fondo', FondoSchema);
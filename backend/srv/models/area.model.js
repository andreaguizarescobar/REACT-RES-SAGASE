import { Schema, model } from 'mongoose';

const AreaSchema = new Schema({
  clave: { type: String, required: true, unique: true },
  nombre: String,
  abreviatura: String,
  direccion: Boolean,
  pertenece: { type: Schema.Types.ObjectId, ref: 'Area' },
}, { timestamps: true });

export default model('Area', AreaSchema);
import { Schema, model } from 'mongoose';

const RemitenteSchema = new Schema({
  remId: { type: String, required: true, unique: true },
  name: String,
  tipo: String,
  cargo: String,
  area: String,
  dependencia: String
}, { timestamps: true });

export default model('Remitentes', RemitenteSchema);
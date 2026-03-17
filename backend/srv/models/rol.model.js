import { Schema, model } from 'mongoose';

const RolSchema = new Schema({
  roleId: { type: String, required: true, unique: true },
  name: String,
  descripcion: String,
  procesos: [String]
}, { timestamps: true });

export default model('Roles', RolSchema);
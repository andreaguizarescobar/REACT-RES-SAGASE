import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nombre: String,
  iniciales: String,
  cargo: String,
  area: String,
  telefono: String,
  email: String,
  status: String,
  rol: { type: String },
  // Campos para recuperación de contraseña
  resetToken: String,
  resetTokenExpires: Date
}, { timestamps: true });

export default model('users', UserSchema);
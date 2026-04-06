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
  ext: String,
  email: String,
  status: String,
  sexo: String,
  copia: Boolean,
  roles: [{rol: { type: String }}],
  // Campos para recuperación de contraseña
  resetToken: String,
  resetTokenExpires: Date,
  //campos para cambio de contraseña en primer inicio de sesión
  firstLogin: { type: Boolean, default: true },
  passwordChangedAt: Date,

  createdBy: String,
  updatedBy: String,
}, { timestamps: true });

export default model('users', UserSchema);
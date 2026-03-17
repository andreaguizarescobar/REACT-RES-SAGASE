import { hash, compare } from 'bcryptjs';
import crypto from 'crypto';
import userModel from '../models/user.model.js';
import jwt from '../config/jwt.js';
import mailService from './mail.service.js';

const registerUser = async (data) => {
  const userExists = await userModel.findOne({
    username: data.username
  });
  if (userExists && data != null) {
    throw new Error("El usuario ya existe");
  }
  const hashedPassword = await hash(data.password, 10);
  const user = await userModel.create({
    ...data,
    password: hashedPassword
  });
  return user;
};

const loginUser = async (username, password) => {
  const user = await userModel.findOne({ username });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  const validPassword = await compare(password, user.password);
  if (!validPassword) {
    throw new Error("Contraseña incorrecta");
  }
  const token = jwt.generateToken(user);
  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      nombre: user.nombre,
      rol: user.rol,
      area: user.area
    }
  };
};

export const forgotPassword = async (email) => {
  const user = await userModel.findOne({ email });
  if (!user) return;
  const token = crypto.randomBytes(32).toString('hex');
  user.resetToken = token;
  user.resetTokenExpires = Date.now() + 1000 * 60 * 15;
  await user.save();
  await sendResetEmail(user.email, token);
};

export const resetPassword = async (token, newPassword) => {
  const user = await userModel.findOne({
    resetToken: token,
    resetTokenExpires: { $gt: Date.now() }
  });
  if (!user) {
    throw new Error("Token inválido o expirado");
  }
  const hashedPassword = await hash(newPassword, 10);
  user.password = hashedPassword;
  user.resetToken = null;
  user.resetTokenExpires = null;
  await user.save();
  return "Contraseña actualizada";
};


export default {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
};
import { hash, compare } from 'bcryptjs';
import crypto from 'crypto';
import userModel from '../models/user.model.js';
import jwt from '../config/jwt.js';
import { sendResetEmail } from './mail.service.js';
import path from 'path';

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
      _id: user._id,
      userId: user.userId,
      username: user.username,
      nombre: user.nombre,
      roles: user.roles,
      area: user.area,
      firstLogin: user.firstLogin
    }
  };
};

export const getAllUsers = async () => {
  return await userModel.find();
};

export const getUser = async (userId) => {
  return await userModel.findOne({ userId });
};

export const deleteUser = async (userId) => {
  return await userModel.deleteOne({ userId });
};

export const patchUser = async (userId, data) => {
  return await userModel.findOneAndUpdate({ userId }, data);
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

export const cambioPassword = async (userId, currentPassword, newPassword) => {
  const user = await userModel.findOne({ userId });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  const validPassword = await compare(currentPassword, user.password);
  if (!validPassword) {
    throw new Error("Contraseña actual incorrecta");
  }
  const hashedPassword = await hash(newPassword, 10);
  user.password = hashedPassword;
  user.firstLogin = false;
  await user.save();
  return "Contraseña actualizada";
};

export const getTareas = async (userId) => {
  const user = await userModel.findOne({userId: userId }).populate({path: 'tareas', populate: 
    {path: 'documento', populate: [{path: 'turnados', populate: [{path: 'remitente', select: 'name'}, {path: 'dirigido', select: 'nombre'}]},
  {path: 'tipo', select: 'tipo'}]}}).exec();
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  return user.tareas;
};

// Mover una tarea de usuario de entrada a pendientes
export const moveTarea = async (userId, tareaId) => {
  const user = await userModel.findOne({ _id: userId });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  const tarea = user.tareas.id(tareaId);
  if (!tarea) {
    throw new Error("Tarea no encontrada");
  }
  if (tarea.status === 'entrada') {
    tarea.status = 'pendiente';
  }
  await user.save();
  return "Tarea movida a pendientes";
};

// Marcar una tarea como concluida, y actualizar el status en el documento asociado y añadir notas si se proporcionan
import documentoModel from '../models/documento.model.js';
export const concluirTarea = async (userId, tareaId, notas) => {
  const user = await userModel.findOne({ _id: userId });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  const tarea = user.tareas.id(tareaId);
  if (!tarea) {
    throw new Error("Tarea no encontrada");
  }
  tarea.status = 'salida';
  tarea.fecha = new Date();
  // Actualizar el status en el documento asociado
  const documento = await documentoModel.findById(tarea.documento);
  if (documento) {
    documento.status = 'Concluido';
    if (notas) {
      documento.notas = notas;
    }
    await documento.save();
  }
  await user.save();
  return "Tarea marcada como concluida";
};

export default {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getUser,
  getAllUsers,
  deleteUser,
  patchUser,
  cambioPassword,
  getTareas,
  moveTarea,
  concluirTarea
};
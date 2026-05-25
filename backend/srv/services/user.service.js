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
  // si el usuario es validador, incluir tareas del area de secretaria particular
  if (user.roles.some((rol) => rol.rol === 'VALIDADOR')) {
    const secretaria = await areaModel.findOne({ nombre: 'SECRETARIA PARTICULAR' }).populate({path: 'tareas', populate: 
    {path: 'documento', populate: [{path: 'turnados', populate: [{path: 'remitente', select: 'name'}, {path: 'dirigido', select: 'nombre'}]},
  {path: 'tipo', select: 'tipo'}]}});
    user.tareas.push(...secretaria.tareas);
  }
  return user.tareas;
};

// Mover una tarea de usuario de entrada a pendientes
import areaModel from '../models/area.model.js';
export const moveTarea = async (userId, tareaId) => {
  const user = await userModel.findOne({ _id: userId });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  const tarea = user.tareas.id(tareaId);
  if (!tarea) {
    // Buscar en tareas del área de secretaria particular
    const secretaria = await areaModel.findOne({ nombre: 'SECRETARIA PARTICULAR' });
    if (secretaria) {
      const tareaArea = secretaria.tareas.id(tareaId);
      if (tareaArea) {
        // Mover tarea del área a pendientes del usuario
        user.tareas.push({
          tarea: tareaArea.tarea,
          status: 'pendiente',
          proceso: tareaArea.proceso,
          documento: tareaArea.documento,
          fecha: new Date(),
          notas: tareaArea.notas
        });

        secretaria.tareas.pull(tareaArea._id);
        await secretaria.save();
        await user.save();
        return "Tarea movida a pendientes";
      }
    }
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
  tarea.fecha = new Date();

  // agregar tarea a área correspondiente
  const area = await areaModel.findOne({ nombre: 'SECRETARIA PARTICULAR' });
  if (area) {
    area.tareas.push({
      tarea: `Revisión de documento`,
      proceso: tarea.proceso,
      status: 'entrada',
      fecha: new Date(),
      descripcion: tarea.descripcion,
      documento: tarea.documento
    });
    await area.save();
  }
  

  tarea.status = 'salida';
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

export const validarTarea = async (userId, tareaId) => {
  const user = await userModel.findOne({ _id: userId });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  const tarea = user.tareas.id(tareaId);
  if (!tarea) {
    throw new Error("Tarea no encontrada");
  }
  if (tarea.status === 'pendiente') {
    tarea.titulo = 'Documento validado';
    tarea.proceso = 'Validación';
    tarea.status = 'salida';
  }

  const documento = await documentoModel.findById(tarea.documento);
  if (documento) {
    documento.status = 'Validado';
    await documento.save();
  }

  await user.save();
  return "Tarea movida a salida";
};

export const devolverTarea = async (userId, tareaId) => {
  const user = await userModel.findOne({ _id: userId });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  const tarea = user.tareas.id(tareaId);
  if (!tarea) {
    throw new Error("Tarea no encontrada");
  }

  const documento = await documentoModel.findById(tarea.documento);
  if (!documento) {
    throw new Error("Documento asociado no encontrado");
  }

  const lastTurnado = documento.turnados?.[documento.turnados.length - 1];
  if (!lastTurnado || !lastTurnado.dirigido) {
    throw new Error("No se encontró un último turno dirigido");
  }

  tarea.status = 'salida';

  const destinatario = await userModel.findById(lastTurnado.dirigido);
  if (!destinatario) {
    throw new Error("Usuario destino no encontrado");
  }
// si el usuario tiene la tarea en salidas, cambiarla a entrada, si no, agregar una nueva tarea de entrada
  const tareaDestinatario = destinatario.tareas.find(t => t.documento.toString() === documento._id.toString() && t.status === 'salida');
  if (tareaDestinatario) {
    tareaDestinatario.status = 'entrada';
  } else {
    destinatario.tareas.push({
    tarea: 'Revisar respuesta devuelta',
    proceso: tarea.proceso,
    status: 'entrada',
    fecha: new Date(),
    descripcion: 'Responder con correcciones solicitadas',
    documento: documento._id
  });
  }

  await user.save();
  await destinatario.save();
  return "Tarea devuelta al último dirigido";
};

import solicitudModel from '../models/solicitud.model.js';
export const solicitud = async (data) => {
  const solicitud = await solicitudModel.create(data);
  return "Solicitud enviada";
};

export const getSolicitudes = async () => {
  return await solicitudModel.find({ status: 'Pendiente' }).populate('area');
};

export const approveSolicitud = async (solicitudId) => {
  const solicitud = await solicitudModel.findById(solicitudId).populate('area', 'nombre');
  if (!solicitud) {
    throw new Error('Solicitud no encontrada');
  }

  const baseUserName = `AGN-${(solicitud.iniciales || 'USR').replace(/\s+/g, '')}`;
  let username = baseUserName;
  let counter = 0;

  while (await userModel.findOne({ username })) {
    counter += 1;
    username = `${baseUserName}${counter}`;
  }

  const password = Math.random().toString(36).slice(-8) || 'Password1';
  const hashedPassword = await hash(password, 10);

  const user = await userModel.create({
    userId: `user-${(solicitud.iniciales || 'USR').replace(/\s+/g, '')}-${Date.now()}`,
    username,
    password: hashedPassword,
    nombre: solicitud.nombre,
    iniciales: solicitud.iniciales,
    sexo: solicitud.sexo,
    cargo: solicitud.cargo,
    area: solicitud.area?.nombre || solicitud.area,
    telefono: solicitud.telefono,
    ext: solicitud.ext,
    email: solicitud.email,
    copia: solicitud.copia,
    status: 'Activo',
    firstLogin: true,
    roles: []
  });

  solicitud.status = 'Aprobada';
  await solicitud.save();

  return {
    message: 'Solicitud aprobada',
    credentials: {
      username,
      password
    },
    user: {
      userId: user.userId,
      username: user.username,
      email: user.email
    }
  };
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
  concluirTarea,
  validarTarea,
  devolverTarea,
  solicitud,
  getSolicitudes,
  approveSolicitud
};
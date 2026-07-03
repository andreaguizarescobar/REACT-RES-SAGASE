import { hash, compare } from 'bcryptjs';
import crypto from 'crypto';
import userModel from '../models/user.model.js';
import jwt from '../config/jwt.js';
import { sendResetEmail, enviarUsuario } from './mail.service.js';
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
  await enviarUsuario(data.email, data.username, data.password);
  return user;
};

const tiempoRestante = (fecha) => {
  const ahora = new Date();
  const fechaObj = new Date(fecha);

  const diffMs = fechaObj - ahora;

  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const horas = Math.floor(diffMs / (1000 * 60 * 60));
  const minutos = Math.floor(diffMs / (1000 * 60));

  if (dias > 0) return `${dias} dia${dias > 1 ? "s" : ""} `;
  if (horas > 0) return `${horas} hora${horas > 1 ? "s" : ""} `;
  if (minutos > 0) return `${minutos} minuto${minutos > 1 ? "s" : ""} `;

  return `Finalizó ${tiempoTranscurrido(fecha)}`;
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
  // comprobar si el usuario tiene tareas pendientes apunto de vencer y añadirlas a notificaciones
  const tareasPendientes = user.tareas.filter(t => t.status === 'pendiente');
  tareasPendientes?.forEach( async (tarea) => {
    const documento = await documentoModel.findById(tarea.documento);
  const ultimoTurnado = documento.turnados?.at(-1);
    console.log("Último turnado:", documento);
  if (
    ultimoTurnado?.compromiso &&
    ultimoTurnado.compromiso < Date.now() + 1000 * 60 * 60 * 24 * 3 &&
    ultimoTurnado.compromiso > Date.now()
  ) {
    user.notificaciones.push({
      tarea: "Tarea pendiente próxima por vencer",
      descripcion: `El documento ${documento.docId} tiene un compromiso próximo a vencer en ${tiempoRestante(ultimoTurnado.compromiso)}. Recuerda atender el asunto asignado antes del plazo límite.`,
      status: 'Sin leer',
      documento: tarea.documento,
      fecha: new Date()
    });
    user.save();
  }
});


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
import areaModel from '../models/area.model.js';
export const getAllUsers = async () => {
  const users = await userModel.find().lean();
  const areas = await areaModel.find().lean();

  const areasMap = new Map(
    areas.map(area => [area.nombre, area._id])
  );

  return users.map(user => ({
    ...user,
    areaId: areasMap.get(user.area) || null
  }));
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
      // actualizar status del documento asociado a pendiente
      const documento = await documentoModel.findById(tarea.documento);
      documento.status = 'Recibido, en ejecución';

      // notificar al registrador que el documento fue tomado por el ejecutor
      const userRegistrador = await userModel.findById(documento.registrador);
      if (userRegistrador) {
        userRegistrador.notificaciones.push({
          tarea: "Documento en ejecución",
          descripcion: `El documento ${documento.docId} ha sido entragado al área ${user.area} para su ejecución. Puedes revisar el progreso del trámite en el sistema.`,
          status: 'Sin leer',
          documento: documento._id,
          fecha: new Date()
        });
        await documento.save();
        console.log("Notificación enviada al registrador:", userRegistrador);
        await userRegistrador.save();
      }
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
    documento.status = 'Con respuesta registrada';
    // Notificar al registrador que el documento fue concluido por el ejecutor
    const userRegistrador = await userModel.findById(documento.registrador);
    if (userRegistrador) {
      userRegistrador.notificaciones.push({
        tarea: "Documento con respuesta registrada",
        descripcion: `El documento ${documento.docId} ha sido concluido por el área ${user.area}. Puedes revisar el progreso del trámite en el sistema.`,
        status: 'Sin leer',
        documento: documento._id,
        fecha: new Date()
      });
      await userRegistrador.save();
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
    documento.validador = user._id;
    // Notificar al registrador que el documento fue validado por el validador
    const userRegistrador = await userModel.findById(documento.registrador);
    if (userRegistrador) {
      userRegistrador.notificaciones.push({
        tarea: "Documento validado",
        descripcion: `El documento ${documento.docId} ha sido validado. Puedes revisar el progreso del trámite en el sistema.`,
        status: 'Sin leer',
        documento: documento._id,
        fecha: new Date()
      });
      await userRegistrador.save();
    }
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

export const getNotificaciones = async (userId) => {
  const user = await userModel.findOne({ userId }).populate({ path: 'notificaciones.documento', select: 'docId' });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  return user.notificaciones;
};

export const marcarNotificacionLeida = async (userId, notifId) => {
  const user = await userModel.findOne({ userId });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  const notif = user.notificaciones.id(notifId);
  if (!notif) {
    throw new Error("Notificación no encontrada");
  }
  notif.status = 'Leida';
  await user.save();
  return "Notificación marcada como leida";
};

export const marcarTodasNotificacionesLeidas = async (userId) => {
  const user = await userModel.findOne({ userId });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  user.notificaciones.forEach(notif => notif.status = 'Leida');
  await user.save();
  return "Todas las notificaciones marcadas como leidas";
};

export const clearNotificaciones = async (userId) => {
  const user = await userModel.findOne({ userId });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  // Eliminar solo las notificaciones leídas
  user.notificaciones = user.notificaciones.filter(notif => notif.status !== 'Leida');
  await user.save();
  return "Notificaciones eliminadas";
};

export const getCopias = async (userId) => {
  const user = await userModel.findOne({ userId }).populate({ path: 'copias', select: 'docId' });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  return user.copias;
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
  approveSolicitud,
  getNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
  clearNotificaciones,
  getCopias
};
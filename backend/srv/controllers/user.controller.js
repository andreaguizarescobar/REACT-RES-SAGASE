import userService from '../services/user.service.js';

const register = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json({
      message: "Usuario registrado",
      user
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const data = await userService.loginUser(username, password);
    res.json(data);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();  
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener usuarios"
    });
  }
};

const getUser = async (req, res) => {  
  try {
    const userId = req.params.userId;
    const user = await userService.getUser(userId);
    res.json({ user });
  } catch (error) {
    res.status(404).json({
      message: "Usuario no encontrado"
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    await userService.deleteUser(userId);
    res.json({
      message: "Usuario eliminado"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar usuario"
    });
  }
};

const patchUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const updates = req.body;
    const user = await userService.patchUser(userId, updates);
    res.json({
      message: "Usuario actualizado",
      user
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

export const forgot = async (req, res) => {
  try {
    const { email } = req.body;
    await userService.forgotPassword(email);
    res.json({
      message: "Si el correo existe, se envió un enlace"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const reset = async (req, res) => {
  try {
    const { token, password } = req.body;
    const result = await userService.resetPassword(token, password);
    res.json({ message: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const cambiarPassword = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { currentPassword, newPassword } = req.body;
    const result = await userService.cambioPassword(userId, currentPassword, newPassword);
    res.json({ message: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyToken = async (req, res) => {
  try {
    res.json({ message: "Token válido" });
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
  }
};

export const getTareas = async (req, res) => {
  try {
    const userId = req.params.userId;
    const tareas = await userService.getTareas(userId);
    res.json({ tareas });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const moveTarea = async (req, res) => {
  try {
    const tareaId = req.params.tareaId;
    const userId = req.user.id; // Asegúrate de que el middleware de autenticación establezca userId en req
    const result = await userService.moveTarea(userId, tareaId);
    res.json({ message: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const concluirTarea = async (req, res) => {
  try {
    const tareaId = req.params.tareaId;
    const notas = req.body.notas;
    const userId = req.user.id; // Asegúrate de que el middleware de autenticación establezca userId en req
    console.log(`Concluyendo tarea ${tareaId} para el usuario ${userId}`);
    const result = await userService.concluirTarea(userId, tareaId, notas);
    res.json({ message: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const validarTarea = async (req, res) => {
  try {
    const tareaId = req.params.tareaId;
    const userId = req.user.id; // Asegúrate de que el middleware de autenticación establezca userId en req
    const result = await userService.validarTarea(userId, tareaId);
    res.json({ message: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const devolverTarea = async (req, res) => {
  try {
    const tareaId = req.params.tareaId;
    const userId = req.user.id;
    const result = await userService.devolverTarea(userId, tareaId);
    res.json({ message: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSolicitudes = async (req, res) => {
  try {
    const solicitudes = await userService.getSolicitudes();
    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveSolicitud = async (req, res) => {
  try {
    const solicitudId = req.params.id;
    const result = await userService.approveSolicitud(solicitudId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const solicitud = async (req, res) => {
  try {
    const result = await userService.solicitud(req.body);
    res.json({ message: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default {
  register,
  login,
  forgot,
  reset,
  getUser,
  getAllUsers,
  deleteUser,
  patchUser,
  cambiarPassword,
  verifyToken,
  getTareas,
  moveTarea,
  concluirTarea,
  validarTarea,
  devolverTarea,
  getSolicitudes,
  approveSolicitud,
  solicitud
};
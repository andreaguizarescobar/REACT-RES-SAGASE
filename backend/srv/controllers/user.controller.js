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

export default {
  register,
  login,
  forgot,
  reset,
  getUser,
  getAllUsers,
  deleteUser,
  patchUser,
  cambiarPassword
};
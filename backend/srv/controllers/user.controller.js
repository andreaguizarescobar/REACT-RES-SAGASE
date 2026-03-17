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

export default {
  register,
  login,
  forgot,
  reset
};
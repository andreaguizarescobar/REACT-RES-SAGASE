import { transporter } from "../config/mail.js";

export const sendResetEmail = async (email, token) => {

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const msg = {
    to: email,
    from: process.env.EMAIL_USER,
    subject: 'Recuperación de contraseña',
    html: `
      <h2>Recuperación de contraseña</h2>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Este enlace expira en 15 minutos.</p>
    `
  };

  await transporter.sendMail(msg)
};

export const enviarUsuario = async (email, user, password) => {
  const msg = {
    to: email,
    from: process.env.EMAIL_USER,
    subject: 'Usuario SAGASE',
    html: `<h2>Registro exitoso</h2>
      <p>Nombre de usuario: ${user}</p>
      <p>Contraseña: ${password}</p>
      <p>¡Bienvenido a SAGASE!</p>
      `
  }
  await transporter.sendMail(msg)
};
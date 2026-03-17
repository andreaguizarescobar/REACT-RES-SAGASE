import pkg from 'jsonwebtoken';

const { sign, verify } = pkg;
const generateToken = (user) => {
  return sign(
    {
      id: user._id,
      username: user.username,
      rol: user.rol,
      area: user.area,
      process: user.procesos 
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '8h'
    }
  );
};

const verifyToken = (token) => {
  return verify(token, process.env.JWT_SECRET);
};

export default {
  generateToken,
  verifyToken
};
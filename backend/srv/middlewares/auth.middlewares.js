import { verify } from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token requerido"
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido"
    });
  }
};

export default authMiddleware;
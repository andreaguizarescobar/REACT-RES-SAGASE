const authorizeRole = (...roles) => {

  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        message: "No tiene permisos para esta acción"
      });
    }
    next();
  };
};
export default authorizeRole;
const authorizeRole = (...roles) => {

  return (req, res, next) => {
    if (!roles.some(role => req.user.roles.map(r => r.rol).includes(role))) {
      return res.status(403).json({
        message: "No tiene permisos para esta acción"
      });
    }
    next();
  };
};
export default authorizeRole;
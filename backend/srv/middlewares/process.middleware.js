const authorizeProcess = (...processes) => {

  return (req, res, next) => {
    const userProcesses = req.user.procesos || [];
    const autorizado = processes.some(p => userProcesses.includes(p));
    if (!autorizado) {
      return res.status(403).json({
        message: "No tiene permisos para ejecutar este proceso"
      });
    }
    next();
  };
};
export default authorizeProcess;
const authorizeArea = (...areas) => {
  return (req, res, next) => {
    const userArea = req.user.area;
    if (!areas.includes(userArea)) {
      return res.status(403).json({
        message: "No pertenece al área autorizada"
      });

    }
    next();
  };
};
export default authorizeArea;
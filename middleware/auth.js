const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Acesso negado, token não fornecido." });
  }
  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      throw new Error("Acesso negado");
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Acesso negado, token inválido" });
  }
};

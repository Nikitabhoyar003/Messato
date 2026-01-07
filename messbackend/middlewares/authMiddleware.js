const jwt = require("jsonwebtoken");

exports.verifyUser = (role) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid token" });

      if (decoded.role !== role)
        return res.status(403).json({ message: "Access denied" });

      req.user = decoded;
      next();
    });
  };
};

const db = require("/backend/config/db");

exports.register = (req, res) => {
  const { name, email, password, role } = req.body;

  const sql = `
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [name, email, password, role], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "User registered", userId: this.lastID });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, user) => {
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json({ id: user.id, role: user.role });
    }
  );
};

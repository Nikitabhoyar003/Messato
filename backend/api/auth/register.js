app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role } = req.body;

  const sql = `INSERT INTO users (name,email,password,role)
               VALUES (?,?,?,?)`;

  db.run(sql, [name, email, password, role], function (err) {
    if (err) return res.status(500).json(err);
    res.json({ message: "User registered", id: this.lastID });
  });
});

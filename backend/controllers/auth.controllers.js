exports.register = (req, res) => {
  const { name, username, email, phoneNumber, password, role } = req.body;

  const sql = `
    INSERT INTO users (name, username, email, phoneNumber, password, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [name || username, username, email, phoneNumber, password, role || "user"],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: err.message });
      }
      res.json({ message: "User registered successfully" });
    }
  );
};

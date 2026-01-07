const db = require("../config/db");

exports.findUserByEmail = (email, callback) => {
  const sql = "SELECT * FROM users WHERE email = ?";
  db.get(sql, [email], callback);
};

exports.createUser = (data, callback) => {
  const sql = `
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
  `;
  db.run(sql, data, callback);
};

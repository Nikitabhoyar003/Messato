const db = require("../config/db");

// 🔹 FIND USER BY EMAIL (MySQL)
exports.findUserByEmail = (email, callback) => {
  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, results) => {
    if (err) return callback(err, null);

    // MySQL returns array
    callback(null, results[0] || null);
  });
};

// 🔹 CREATE USER (MySQL)
exports.createUser = (data, callback) => {
  const sql = `
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, data, (err, result) => {
    if (err) return callback(err, null);

    callback(null, {
      id: result.insertId
    });
  });
};

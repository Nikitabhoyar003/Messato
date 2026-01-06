const express = require("express");
const router = express.Router();
const authController = require("/backend/controller/auth.controller");

router.post("/frontend/src/component/Register.jsx", authController.register);
router.post("/frontend/src/component/Login.jsx", authController.login);

module.exports = router;

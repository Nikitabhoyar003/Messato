const express = require("express");
const router = express.Router();
const authController = require("C:\Users\HP\OneDrive\Desktop\Messato\backend\controllers\authController.js");

router.post("/login", authController.login);
router.post("/register", authController.register);
module.exports = router;



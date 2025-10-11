const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");

// Ruta para registrar un usuario
router.post("/register", userController.registerUser);

// Ruta para autenticar un usuario (login)
router.post("/login", userController.loginUser);

// Ruta para cerrar sesión (logout)
router.post("/logout", userController.logoutUser);

module.exports = router;
const express = require("express");
const router = express.Router();
const logroController = require("../controllers/logro.controller");

// GET /logros/ -> lista todos los logros del sistema
router.get("/", logroController.getAllLogros);

// GET /logros/actual -> devuelve logro actual y siguiente logro
router.get("/actual", logroController.getLogroActual);

// GET /logros/desbloqueados -> devuelve logros desbloqueados por el usuario
router.get("/desbloqueados", logroController.getLogrosUsuario);

module.exports = router;
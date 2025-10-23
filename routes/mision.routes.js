const express = require("express");
const router = express.Router();
const misionController = require("../controllers/mision.controller");

// ============================
// Rutas del CRUD de misiones
// ============================

// Obtener todas las misiones
router.get("/", misionController.getAllMisiones);

// Obtener misión por ID
router.get("/:id", misionController.getMisionById);

// Crear nueva misión
router.post("/", misionController.createMision);

// Actualizar misión por ID
router.put("/:id", misionController.updateMision);

// Eliminar misión por ID
router.delete("/:id", misionController.deleteMision);

// Terminar misión (sumar puntos y logros)
router.post("/terminar", misionController.terminarMision);

module.exports = router;

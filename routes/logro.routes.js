const express = require("express");
const router = express.Router();
const logroController = require("../controllers/logro.controller");

router.get("/actual", logroController.getLogroActual);
router.get("/desbloqueados", logroController.getLogrosUsuario);

router.get("/", logroController.getAllLogros); 
router.get("/:id", logroController.getLogroById);
router.post("/", logroController.createLogro);
router.put("/:id", logroController.updateLogro);
router.delete("/:id", logroController.deleteLogro);

module.exports = router;

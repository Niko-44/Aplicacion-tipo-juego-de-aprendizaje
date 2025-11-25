const express = require("express");
const router = express.Router();
const misionController = require("../controllers/mision.controller");

router.get("/", misionController.getAllMisiones);
router.get("/:id", misionController.getMisionById);
router.post("/", misionController.createMision);
router.put("/:id", misionController.updateMision);
router.delete("/:id", misionController.deleteMision);
router.post("/terminar", misionController.terminarMision);

module.exports = router;

const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");

// Cuando se accede a la raíz o /inicio, ejecutamos ensureUser que crea/valida cookie y devuelve la vista
router.get("/", userController.ensureUser);
router.get("/inicio", userController.ensureUser);

module.exports = router;
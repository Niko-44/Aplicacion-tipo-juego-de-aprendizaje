const express = require("express");
const router = express.Router();
const misionController = require("../controllers/mision.controller");

router.get("/", misionController.getAllMisiones);

module.exports = router;

const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");


router.get("/", userController.ensureUser);
router.get("/inicio", userController.ensureUser);
router.get("/misiones", userController.getUserMissions);

module.exports = router;
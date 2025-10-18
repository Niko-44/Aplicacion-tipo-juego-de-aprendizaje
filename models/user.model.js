const e = require("express");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  nombre_usuario: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  uuid: { type: String, required: true, unique: true },
  progreso: {
    misiones_completadas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mision", default: [] }],
    puntos: { type: Number, default: 0 },
    logros: [{ type: mongoose.Schema.Types.ObjectId, ref: "Logro", default: [] }]
  }
});

module.exports = mongoose.model("User", userSchema);

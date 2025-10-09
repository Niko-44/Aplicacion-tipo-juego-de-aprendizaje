const mongoose = require("mongoose");

const logroSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  puntos_requeridos: { type: Number, required: true }
});

const Logro = mongoose.model("Logro", logroSchema);

module.exports = { Logro };
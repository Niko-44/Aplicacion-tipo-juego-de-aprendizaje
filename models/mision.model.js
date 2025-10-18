const mongoose = require("mongoose");

const misionSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  pasos: [{ type: String, required: true }],
  tipo: { type: String, required: true },
  nivel: { type: String, required: true }
});

module.exports = mongoose.model("Mision", misionSchema); 

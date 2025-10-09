const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  nombre_usuario: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  progreso: {
    misiones_completadas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mision" }],
    puntos: { type: Number, default: 0 },
    logros: [{ type: mongoose.Schema.Types.ObjectId, ref: "Logro" }]
  }
});


module.exports = mongoose.model("User", userSchema);

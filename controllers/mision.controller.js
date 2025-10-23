const Mision = require("../models/mision.model");
const User = require("../models/user.model");
const { Logro } = require("../models/logro.model");
const mongoose = require("mongoose");

// ============================
// Terminar misión
// ============================
const terminarMision = async (req, res) => {
  try {
    const { misionId, puntos } = req.body;
    const userId = req.cookies && req.cookies.userId;
    if (!userId) return res.status(401).json({ message: "Usuario no autenticado" });

    const user = await User.findById(userId).exec();
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const completadas = (user.progreso.misiones_completadas || []).map(id => id.toString());
    const logrosActualesSet = new Set((user.progreso.logros || []).map(id => id.toString()));

    if (!completadas.includes(String(misionId))) {
      user.progreso.misiones_completadas.push(misionId);
      const ptsToAdd = (typeof puntos === "number") ? puntos : 10;
      user.progreso.puntos = (user.progreso.puntos || 0) + ptsToAdd;
    }

    const puntosUsuario = user.progreso.puntos || 0;
    const posiblesLogros = await Logro.find({ puntos_requeridos: { $lte: puntosUsuario } }).sort({ puntos_requeridos: 1 }).exec();

    for (const logro of posiblesLogros) {
      const idStr = logro._id.toString();
      if (!logrosActualesSet.has(idStr)) {
        user.progreso.logros.push(logro._id);
        logrosActualesSet.add(idStr);
      }
    }

    await user.save();

    const logrosPoblados = await Logro.find({ _id: { $in: user.progreso.logros } }).sort({ puntos_requeridos: 1 }).exec();

    return res.json({
      message: "Misión procesada",
      puntos: user.progreso.puntos,
      misiones_completadas: user.progreso.misiones_completadas,
      logros: logrosPoblados
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al completar la misión" });
  }
};

// ============================
// Obtener todas las misiones
// ============================
const getAllMisiones = async (req, res) => {
  try {
    const misiones = await Mision.find();
    res.status(200).json(misiones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener misiones" });
  }
};

// ============================
// Obtener misión por ID
// ============================
const getMisionById = async (req, res) => {
  try {
    const { id } = req.params;
    const mision = await Mision.findById(id);
    if (!mision) return res.status(404).json({ message: "Misión no encontrada" });
    res.status(200).json(mision);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la misión" });
  }
};

// ============================
// Crear misión
// ============================
const createMision = async (req, res) => {
  try {
    const { titulo, descripcion, pasos, tipo, nivel } = req.body;
    const nuevaMision = new Mision({ titulo, descripcion, pasos, tipo, nivel });
    const misionGuardada = await nuevaMision.save();
    res.status(201).json(misionGuardada);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error al crear la misión", error });
  }
};

// ============================
// Actualizar misión por ID
// ============================
const updateMision = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, pasos, tipo, nivel } = req.body;
    const misionActualizada = await Mision.findByIdAndUpdate(
      id,
      { titulo, descripcion, pasos, tipo, nivel },
      { new: true, runValidators: true }
    );
    if (!misionActualizada) return res.status(404).json({ message: "Misión no encontrada" });
    res.status(200).json(misionActualizada);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error al actualizar la misión", error });
  }
};

// ============================
// Eliminar misión por ID
// ============================
const deleteMision = async (req, res) => {
  try {
    const { id } = req.params;
    const misionEliminada = await Mision.findByIdAndDelete(id);
    if (!misionEliminada) return res.status(404).json({ message: "Misión no encontrada" });
    res.status(200).json({ message: "Misión eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la misión", error });
  }
};

module.exports = {
  getAllMisiones,
  getMisionById,
  createMision,
  updateMision,
  deleteMision,
  terminarMision
};

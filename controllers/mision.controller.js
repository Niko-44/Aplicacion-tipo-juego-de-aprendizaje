const Mision = require("../models/mision.model");
const User = require("../models/user.model");
const { Logro } = require("../models/logro.model");
const mongoose = require("mongoose");

const terminarMision = async (req, res) => {
  try {
    const { misionId, puntos } = req.body;
    const userId = req.cookies && req.cookies.userId;
    if (!userId) return res.status(401).json({ message: "Usuario no autenticado" });

    const user = await User.findById(userId).exec();
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Normalizar ids a strings
    const completadas = (user.progreso.misiones_completadas || []).map(id => id.toString());
    const logrosActualesSet = new Set((user.progreso.logros || []).map(id => id.toString()));

    // Añadir misión y puntos si no estaba completada
    if (!completadas.includes(String(misionId))) {
      user.progreso.misiones_completadas.push(misionId);
      const ptsToAdd = (typeof puntos === "number") ? puntos : 10;
      user.progreso.puntos = (user.progreso.puntos || 0) + ptsToAdd;
    }

    // Calcular logros que corresponden por puntos (idempotente)
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

    // Devolver logros poblados para el frontend
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

const getAllMisiones = async (req, res) => {
  try {
    const misiones = await Mision.find();
    res.status(200).json(misiones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener misiones" });
  }
};

const getMisionById = async (req, res) => {
  try {
    const { id } = req.params;
    const mision = await Mision.findById(id);

    if (!mision) {
      return res.status(404).json({ message: "Misión no encontrada" });
    }

    res.status(200).json(mision);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la misión" });
  }
};

module.exports = { getAllMisiones, getMisionById, terminarMision };

const User = require("../models/user.model");
const { Logro } = require("../models/logro.model");

const ensureUserLogrosSynced = async (user) => {
  // Sincroniza los logros del usuario en base a sus puntos (idempotente)
  const puntos = user.progreso.puntos || 0;
  const actualesSet = new Set((user.progreso.logros || []).map(id => id.toString()));
  const logrosPorPuntos = await Logro.find({ puntos_requeridos: { $lte: puntos } }).sort({ puntos_requeridos: 1 }).exec();
  let changed = false;
  for (const l of logrosPorPuntos) {
    const idStr = l._id.toString();
    if (!actualesSet.has(idStr)) {
      user.progreso.logros.push(l._id);
      actualesSet.add(idStr);
      changed = true;
    }
  }
  if (changed) await user.save();
};

const getLogroActual = async (req, res) => {
  try {
    const userId = req.cookies && req.cookies.userId;
    if (!userId) return res.status(401).json({ message: "Usuario no autenticado" });

    const user = await User.findById(userId).exec();
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Asegurar que el usuario tenga asignados los logros que le corresponden por puntos
    await ensureUserLogrosSynced(user);

    const puntos = user.progreso.puntos || 0;

    // Logro actual: el mayor con puntos_requeridos <= puntos
    const logroActual = await Logro.findOne({ puntos_requeridos: { $lte: puntos } }).sort({ puntos_requeridos: -1 }).exec();

    // Siguiente logro a alcanzar
    const siguienteLogro = await Logro.findOne({ puntos_requeridos: { $gt: puntos } }).sort({ puntos_requeridos: 1 }).exec();

    return res.json({
      puntos,
      logroActual,
      siguienteLogro
    });
  } catch (err) {
    console.error("getLogroActual error:", err);
    return res.status(500).json({ message: "Error al obtener logro actual" });
  }
};

const getAllLogros = async (req, res) => {
  try {
    const logros = await Logro.find().sort({ puntos_requeridos: 1 }).exec();
    res.json(logros);
  } catch (err) {
    console.error("getAllLogros error:", err);
    res.status(500).json({ message: "Error al obtener logros" });
  }
};

const getLogrosUsuario = async (req, res) => {
  try {
    const userId = req.cookies && req.cookies.userId;
    if (!userId) return res.status(401).json({ message: "Usuario no autenticado" });

    const user = await User.findById(userId).exec();
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Sincronizar por puntos por si faltara algún logro
    await ensureUserLogrosSynced(user);

    const logros = (user.progreso.logros && user.progreso.logros.length > 0)
      ? await Logro.find({ _id: { $in: user.progreso.logros } }).sort({ puntos_requeridos: 1 }).exec()
      : [];

    res.json({ puntos: user.progreso.puntos || 0, logros });
  } catch (err) {
    console.error("getLogrosUsuario error:", err);
    res.status(500).json({ message: "Error al obtener logros del usuario" });
  }
};

module.exports = { getLogroActual, getAllLogros, getLogrosUsuario };
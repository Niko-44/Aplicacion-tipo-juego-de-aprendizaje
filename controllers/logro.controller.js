const User = require("../models/user.model");
const { Logro } = require("../models/logro.model");

// ============================
// Sincronizar logros del usuario según puntos
// ============================
const ensureUserLogrosSynced = async (user) => {
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

// ============================
// Obtener logro actual y siguiente del usuario
// ============================
const getLogroActual = async (req, res) => {
  try {
    const userId = req.cookies && req.cookies.userId;
    if (!userId) return res.status(401).json({ message: "Usuario no autenticado" });

    const user = await User.findById(userId).exec();
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    await ensureUserLogrosSynced(user);

    const puntos = user.progreso.puntos || 0;
    const logroActual = await Logro.findOne({ puntos_requeridos: { $lte: puntos } }).sort({ puntos_requeridos: -1 }).exec();
    const siguienteLogro = await Logro.findOne({ puntos_requeridos: { $gt: puntos } }).sort({ puntos_requeridos: 1 }).exec();

    return res.json({ puntos, logroActual, siguienteLogro });
  } catch (err) {
    console.error("getLogroActual error:", err);
    return res.status(500).json({ message: "Error al obtener logro actual" });
  }
};

// ============================
// Obtener todos los logros
// ============================
const getAllLogros = async (req, res) => {
  try {
    const logros = await Logro.find().sort({ puntos_requeridos: 1 }).exec();
    res.json(logros);
  } catch (err) {
    console.error("getAllLogros error:", err);
    res.status(500).json({ message: "Error al obtener logros" });
  }
};

// ============================
// Obtener logros de un usuario
// ============================
const getLogrosUsuario = async (req, res) => {
  try {
    const userId = req.cookies && req.cookies.userId;
    if (!userId) return res.status(401).json({ message: "Usuario no autenticado" });

    const user = await User.findById(userId).exec();
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

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

// ============================
// Obtener logro por ID
// ============================
const getLogroById = async (req, res) => {
  try {
    const { id } = req.params;
    const logro = await Logro.findById(id);
    if (!logro) return res.status(404).json({ message: "Logro no encontrado" });
    res.json(logro);
  } catch (err) {
    console.error("getLogroById error:", err);
    res.status(500).json({ message: "Error al obtener logro" });
  }
};

// ============================
// Crear logro
// ============================
const createLogro = async (req, res) => {
  try {
    const { nombre, descripcion, puntos_requeridos } = req.body;
    const nuevoLogro = new Logro({ nombre, descripcion, puntos_requeridos });
    const logroGuardado = await nuevoLogro.save();
    res.status(201).json(logroGuardado);
  } catch (err) {
    console.error("createLogro error:", err);
    res.status(400).json({ message: "Error al crear logro", error: err });
  }
};

// ============================
// Actualizar logro
// ============================
const updateLogro = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, puntos_requeridos } = req.body;
    const logroActualizado = await Logro.findByIdAndUpdate(
      id,
      { nombre, descripcion, puntos_requeridos },
      { new: true, runValidators: true }
    );
    if (!logroActualizado) return res.status(404).json({ message: "Logro no encontrado" });
    res.json(logroActualizado);
  } catch (err) {
    console.error("updateLogro error:", err);
    res.status(400).json({ message: "Error al actualizar logro", error: err });
  }
};

// ============================
// Eliminar logro
// ============================
const deleteLogro = async (req, res) => {
  try {
    const { id } = req.params;
    const logroEliminado = await Logro.findByIdAndDelete(id);
    if (!logroEliminado) return res.status(404).json({ message: "Logro no encontrado" });
    res.json({ message: "Logro eliminado correctamente" });
  } catch (err) {
    console.error("deleteLogro error:", err);
    res.status(500).json({ message: "Error al eliminar logro", error: err });
  }
};

module.exports = {
  getLogroActual,
  getAllLogros,
  getLogrosUsuario,
  getLogroById,
  createLogro,
  updateLogro,
  deleteLogro
};

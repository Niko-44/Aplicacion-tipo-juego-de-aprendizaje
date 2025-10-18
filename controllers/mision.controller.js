const Mision = require("../models/mision.model");
const User = require("../models/user.model");
const { Logro } = require("../models/logro.model"); // Asegúrate de importar el modelo de Logro

const terminarMision = async (req, res) => {
  try {
    const { misionId, puntos } = req.body;
    const userId = req.cookies.userId;

    if (!userId) return res.status(401).json({ message: "Usuario no autenticado" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Evitar que se agregue la misma misión dos veces
    if (!user.progreso.misiones_completadas.includes(misionId)) {
      user.progreso.misiones_completadas.push(misionId);
      user.progreso.puntos += puntos || 10; // por defecto 10 puntos si no se especifica
      await user.save();

      // Verificar logros
      const logros = await Logro.find(); // Obtener todos los logros
      logros.forEach(logro => {
        if (user.progreso.puntos >= logro.puntos_requeridos && !user.progreso.logros.includes(logro._id)) {
          user.progreso.logros.push(logro._id); // Asignar logro al usuario
        }
      });
      await user.save(); // Guardar cambios en el usuario
    }

    return res.json({ message: "Misión completada", puntos: user.progreso.puntos, logros: user.progreso.logros });
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

// Nuevo controlador para obtener una misión específica
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

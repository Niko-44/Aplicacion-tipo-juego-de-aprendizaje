const Mision = require("../models/mision.model");

const getAllMisiones = async (req, res) => {
  try {
    const misiones = await Mision.find();
    res.status(200).json(misiones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener misiones" });
  }
};

module.exports = { getAllMisiones };

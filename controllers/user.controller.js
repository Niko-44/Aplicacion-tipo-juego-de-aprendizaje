const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require('uuid');

const User = require("../models/user.model");
const Mision = require("../models/mision.model");

// ============================
// Crear usuario invitado
// ============================

const createGuestUser = async (res) => {
    const random = Math.random().toString(36).substring(2, 9);
    const nombre = "Invitado";
    const nombre_usuario = `user_${random}`;
    const rawPassword = random;
    const password = await bcrypt.hash(rawPassword, 10);
    const email = `${nombre_usuario}@example.com`;
    const uuid = uuidv4();

    const user = new User({
      nombre,
      nombre_usuario,
      password,
      email,
      uuid
    });

    await user.save();

    res.cookie("userId", user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return user;
};

// ============================
// Almacenar o validar usuario mediante cookie
// ============================

const ensureUser = async (req, res, next) => {
  try {
    let userId = req.cookies && req.cookies.userId;
    let user = null;

    if (userId) {
      user = await User.findById(userId).exec();
    }

    if (!user) {
      user = await createGuestUser(res);
    }

    req.user = user;

    const file = path.join(__dirname, "..", "views", "inicio.html");
    if (fs.existsSync(file)) {
      let html = fs.readFileSync(file, "utf8");
      html = html.replace(/<span id="nombreUsuario">.*?<\/span>/, `<span id="nombreUsuario">${user.nombre_usuario}</span>`);
      return res.send(html);
    }

    next();
  } catch (err) {
    console.error("ensureUser error:", err);
    res.status(500).send("Error interno del servidor");
  }
};

// ============================
// Obtener misiones del usuario
// ============================

const getUserMissions = async (req, res) => {
  try {
    let userId = req.cookies.userId;
    let user = null;

    if (userId) {
      user = await User.findById(userId).exec();
    }

    // Si no hay cookie o no se encuentra usuario, crear uno nuevo
    if (!user) {
      user = await createGuestUser(res);
    }

    const todasMisiones = await Mision.find().exec();

    // Verificar si la misión está completada 
    const misionesConEstado = todasMisiones.map(m => ({
      _id: m._id,
      titulo: m.titulo,
      descripcion: m.descripcion,
      nivel: m.nivel,
      iniciada: (user.progreso && user.progreso.misiones_completadas || []).some(mc => mc.equals(m._id))
    }));

    res.json(misionesConEstado);
  } catch (err) {
    console.error("getUserMissions error:", err);
    res.status(500).json({ message: "Error al obtener misiones" });
  }
};

module.exports = { ensureUser, getUserMissions };

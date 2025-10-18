const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require('uuid');
const User = require("../models/user.model");

const ensureUser = async (req, res, next) => {
  try {
    let userId = req.cookies && req.cookies.userId;
    let user = null;

    if (userId) {
      user = await User.findById(userId).exec();
    }

    if (!user) {
      // Crear usuario automático "invitado"
      const random = Math.random().toString(36).substring(2, 9);
      const nombre = "Invitado";
      const nombre_usuario = `user_${random}`;
      const rawPassword = random; // contraseña temporal
      const password = await bcrypt.hash(rawPassword, 10);
      const email = `${nombre_usuario}@example.com`;
      const uuid = uuidv4(); // Generar UUID único

      user = new User({ 
        nombre, 
        nombre_usuario, 
        password, 
        email,
        uuid  // Agregar UUID
      });
      
      await user.save();

      // Guardar id de usuario en cookie
      res.cookie("userId", user._id.toString(), {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
      });
    }

    req.user = user;

    // Si se solicita HTML, inyectar nombre de usuario en inicio.html y devolver
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

module.exports = { ensureUser };

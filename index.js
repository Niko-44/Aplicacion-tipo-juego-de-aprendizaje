const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// Rutas
const userRoutes = require("./routes/users.routes");
const misionRoutes = require("./routes/mision.routes");
const logroRoutes = require("./routes/logro.routes"); // nueva ruta de logros

// Configuración
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

const cors = require('cors');

app.use(cors({
  origin: true, // o poné la URL exacta de tu frontend si está en otro dominio
  credentials: true
}));


mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conexión a MongoDB exitosa"))
  .catch((err) => console.log("Error en la conexión a MongoDB:", err));

// Middlewares
app.set('trust proxy', 1);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Servir archivos estáticos (views)
app.use(express.static(path.join(__dirname, "views")));

// Rutas públicas / vistas y API
app.use("/", userRoutes);            // crea/valida cookie y devuelve inicio.html
app.use("/misiones", misionRoutes);  // API de misiones
app.use("/logros", logroRoutes);     // API de logros (GET /logros/actual)

// Ruta explícita para abrir la página de inicio (opcional)
app.get("/inicio", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "inicio.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin.html"));
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint no encontrado" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error inesperado:", err);
  res.status(500).json({ message: "Error interno del servidor" });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});


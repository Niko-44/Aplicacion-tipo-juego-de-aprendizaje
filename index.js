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
const logroRoutes = require("./routes/logro.routes"); 

// Configuración
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

const cors = require('cors');

app.use(cors({
  origin: true, 
  credentials: true
}));


mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conexión a MongoDB exitosa"))
  .catch((err) => console.log("Error en la conexión a MongoDB:", err));


app.set('trust proxy', 1);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "views")));


app.use("/", userRoutes);            
app.use("/misiones", misionRoutes);  
app.use("/logros", logroRoutes);     

app.get("/inicio", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "inicio.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin.html"));
});

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint no encontrado" });
});

app.use((err, req, res, next) => {
  console.error("Error inesperado:", err);
  res.status(500).json({ message: "Error interno del servidor" });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});


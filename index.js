const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser"); // agregado

require("dotenv").config(); // Cargar variables de entorno desde el archivo .env
const app = express();

// Importar rutas
const userRoutes = require("./routes/users.routes");
const misionRoutes = require("./routes/mision.routes"); // agregado

// Obtener las variables de entorno
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000; // Si no se define el puerto en .env, usa el 3000

// Conexión a la base de datos (MongoDB)
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Conexión a MongoDB exitosa"))
    .catch((err) => console.log("Error en la conexión a MongoDB:", err));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser()); // usado para leer/escribir cookies

// Servir archivos estáticos desde la carpeta views (inicio.html estará accesible)
app.use(express.static(path.join(__dirname, "views")));

// Rutas: delegar raíz a userRoutes que maneja creación/validación de usuario
app.use("/", userRoutes);

// Exponer API de misiones en /misiones
app.use("/misiones", misionRoutes);

// Ruta explícita para abrir la página de inicio
app.get("/inicio", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "inicio.html"));
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});


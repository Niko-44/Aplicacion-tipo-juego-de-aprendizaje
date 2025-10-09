const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config(); // Cargar variables de entorno desde el archivo .env
const app = express();


// Obtener las variables de entorno
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000; // Si no se define el puerto en .env, usa el 3000

// Conexión a la base de datos (MongoDB)
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Conexión a MongoDB exitosa"))
    .catch((err) => console.log("Error en la conexión a MongoDB:", err));

app.get('/', (req, res) => {
    res.send('Hola Mundo');
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("./middlewares/auth");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const path = require("path");


require("dotenv").config(); // Cargar variables de entorno desde el archivo .env
const app = express();

// Importar rutas
const userRoutes = require("./routes/users.routes");

// Obtener las variables de entorno
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000; // Si no se define el puerto en .env, usa el 3000

// Conexión a la base de datos (MongoDB)
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Conexión a MongoDB exitosa"))
    .catch((err) => console.log("Error en la conexión a MongoDB:", err));

// Middleware para procesar datos del cuerpo de la solicitud
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Redirección desde la ruta principal
app.get('/', (req, res) => {
    // Si el usuario tiene un token válido, redirige a /inicio, si no, a /login
    const token = req.cookies.token;
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            return res.redirect('/inicio');
        } catch (err) {
            // Token inválido
            return res.redirect('/login');
        }
    } else {
        return res.redirect('/login');
    }
});


app.use("/users", userRoutes);


// Rutas publicas

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'inicio.html'));
});

app.get('/inicio', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'inicio.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});


// Rutas para usuarios

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

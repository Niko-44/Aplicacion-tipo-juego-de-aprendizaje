const mongoose = require("mongoose");
const { Mision } = require("../models/mision.model"); // Asegúrate de que esta ruta sea correcta

const misiones = [
  {
    titulo: "Exploración Inicial",
    descripcion: "Explora el área inicial y documenta tus hallazgos.",
    pasos: [
      "Salir del campamento",
      "Marcar lugares clave",
      "Regresar con un informe"
    ],
    tipo: "Exploración",
    nivel: "Fácil"
  },
  {
    titulo: "Construcción de Refugio",
    descripcion: "Recolecta materiales y construye un refugio básico.",
    pasos: [
      "Recolectar madera",
      "Buscar herramientas",
      "Levantar una estructura simple"
    ],
    tipo: "Construcción",
    nivel: "Intermedio"
  },
  {
    titulo: "Rescate del Explorador",
    descripcion: "Encuentra y ayuda a un explorador perdido.",
    pasos: [
      "Analizar el mapa",
      "Seguir las pistas",
      "Llevar al explorador de vuelta a salvo"
    ],
    tipo: "Rescate",
    nivel: "Difícil"
  },
  {
    titulo: "Defensa del Campamento",
    descripcion: "Defiende el campamento de posibles ataques.",
    pasos: [
      "Organizar guardias",
      "Construir barricadas",
      "Repeler el ataque"
    ],
    tipo: "Combate",
    nivel: "Avanzado"
  },
  {
    titulo: "Misión de Recolección",
    descripcion: "Recolecta insumos vitales para la base.",
    pasos: [
      "Estudiar el entorno",
      "Identificar recursos útiles",
      "Recolectar y clasificar"
    ],
    tipo: "Supervivencia",
    nivel: "Fácil"
  }
];

async function seedMisiones() {
  try {
    // Conexión a la base de datos
    await mongoose.connect("mongodb+srv://nk:pruebadb@cluster0.nsf3ww2.mongodb.net/sistemaAprendizaje?retryWrites=true&w=majority&appName=Cluster0");

    // Eliminar misiones existentes
    await Mision.deleteMany({});
    console.log("Misiones anteriores eliminadas.");

    // Insertar nuevas misiones
    await Mision.insertMany(misiones);
    console.log("Misiones importadas correctamente.");

    // Cerrar conexión
    await mongoose.disconnect();
    console.log("Conexión cerrada.");
  } catch (error) {
    console.error("Error al importar las misiones:", error);
    await mongoose.disconnect();
  }
}

seedMisiones();

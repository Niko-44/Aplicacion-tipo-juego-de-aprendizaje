const mongoose = require("mongoose");
const { Logro } = require("../models/logro.model");

const logros = [
  {
    nombre: "🌟 Primer Paso",
    descripcion: "Completaste tu primera misión. ¡Bien hecho! 🎉",
    puntos_requeridos: 10
  },
  {
    nombre: "📞 Comunicador",
    descripcion: "Aprendiste a hacer llamadas y enviar mensajes. ¡Estás conectado con el mundo! 🌍",
    puntos_requeridos: 30
  },
  {
    nombre: "💡 Explorador Digital",
    descripcion: "Conectaste tu celular al Wi-Fi y aprendiste a usar nuevas funciones. 🚀",
    puntos_requeridos: 50
  },
  {
    nombre: "🔧 Dominador del Celular",
    descripcion: "Ajustaste brillo, volumen y otras configuraciones con confianza. 🔊📱",
    puntos_requeridos: 80
  },
  {
    nombre: "🏆 Aprendiz Constante",
    descripcion: "Completaste todas las misiones básicas. ¡Tu esfuerzo vale oro! 💛",
    puntos_requeridos: 100
  },
  {
    nombre: "👑 Maestro Digital",
    descripcion: "Has superado los 150 puntos y dominas el uso del celular. ¡Un ejemplo para todos! 👏",
    puntos_requeridos: 150
  }
];

async function seedLogros() {
  try {
    await mongoose.connect("mongodb+srv://nk:pruebadb@cluster0.nsf3ww2.mongodb.net/sistemaAprendizaje?retryWrites=true&w=majority&appName=Cluster0");

    await Logro.deleteMany({});
    console.log("🧹 Logros anteriores eliminados.");

    await Logro.insertMany(logros);
    console.log("🏅 Logros importados correctamente.");

    await mongoose.disconnect();
    console.log("🔒 Conexión cerrada.");
  } catch (error) {
    console.error("❌ Error al importar los logros:", error);
    await mongoose.disconnect();
  }
}

seedLogros();

const mongoose = require("mongoose");
const Mision = require("../models/mision.model");

const misiones = [
  {
    titulo: "📞 Aprender a hacer una llamada",
    descripcion: "Aprende a usar la aplicación de teléfono para comunicarte con tus seres queridos ❤️.",
    pasos: [
      "📱 Abrir la aplicación de Teléfono en tu celular.",
      "🔍 Buscar el ícono verde con forma de teléfono.",
      "📲 Marcar el número que deseas llamar, por ejemplo: 091234567.",
      "✅ Presionar el botón de llamada (ícono verde).",
      "🎵 Esperar el tono… ¡Listo, estás llamando!"
    ],
    tipo: "Comunicación",
    nivel: "Fácil",
    recompensa: "🎁 +10 puntos de confianza",
    consejo: "💡 Cada toque en la pantalla es un paso más para comunicarte mejor."
  },
  {
    titulo: "🎤 Enviar un mensaje de voz por WhatsApp",
    descripcion: "Aprende a grabar y enviar un mensaje de voz para mantenerte en contacto con tus familiares y amigos 💬.",
    pasos: [
      "📱 Abrir la aplicación de WhatsApp.",
      "👤 Seleccionar el contacto al que querés enviar el mensaje.",
      "🎙️ Mantener presionado el ícono del micrófono.",
      "🗣️ Hablar claramente mientras grabás el mensaje.",
      "📩 Soltar el botón para enviarlo."
    ],
    tipo: "Comunicación",
    nivel: "Fácil",
    recompensa: "🎁 +10 puntos de confianza",
    consejo: "💡 Si te equivocás, podés cancelar y volver a grabar sin problema."
  },
  {
    titulo: "🌐 Conectar el celular al Wi-Fi",
    descripcion: "Conéctate a una red Wi-Fi para poder navegar por internet sin gastar tus datos 📶.",
    pasos: [
      "⚙️ Abrir la aplicación de Configuración o Ajustes.",
      "📡 Buscar y tocar la opción 'Wi-Fi'.",
      "🔛 Activar el interruptor si está apagado.",
      "📋 Seleccionar la red que querés usar.",
      "🔐 Escribir la contraseña si te la pide y tocar 'Conectar'."
    ],
    tipo: "Configuración",
    nivel: "Intermedio",
    recompensa: "🎁 +15 puntos de confianza",
    consejo: "💡 Pedí ayuda si no recordás la contraseña del Wi-Fi."
  },
  {
    titulo: "🔊 Ajustar el volumen y brillo",
    descripcion: "Aprende a modificar el volumen y el brillo de tu celular para usarlo de forma más cómoda 🌞🌙.",
    pasos: [
      "🔓 Desbloquear el celular.",
      "🔉 Usar los botones laterales para subir o bajar el volumen.",
      "📲 Abrir el panel superior deslizando el dedo desde arriba hacia abajo.",
      "💡 Mover el control de brillo hacia la derecha o izquierda según necesites."
    ],
    tipo: "Configuración",
    nivel: "Fácil",
    recompensa: "🎁 +10 puntos de confianza",
    consejo: "💡 Un brillo más bajo ahorra batería 🔋; un brillo alto te ayuda a ver mejor 👀."
  }
];

async function seedMisiones() {
  try {
    await mongoose.connect("mongodb+srv://nk:pruebadb@cluster0.nsf3ww2.mongodb.net/sistemaAprendizaje?retryWrites=true&w=majority&appName=Cluster0");

    await Mision.deleteMany({});
    console.log("🧹 Misiones anteriores eliminadas.");

    await Mision.insertMany(misiones);
    console.log("🚀 Misiones importadas correctamente.");

    await mongoose.disconnect();
    console.log("🔒 Conexión cerrada.");
  } catch (error) {
    console.error("❌ Error al importar las misiones:", error);
    await mongoose.disconnect();
  }
}

seedMisiones();

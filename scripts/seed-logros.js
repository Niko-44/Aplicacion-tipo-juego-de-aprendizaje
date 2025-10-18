const mongoose = require('mongoose');
const { Logro } = require('../models/logro.model');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await Logro.deleteMany({});
  await Logro.insertMany([
    { nombre: 'Principiante', descripcion: 'Alcanza 10 puntos', puntos_requeridos: 10 },
    { nombre: 'Intermedio', descripcion: 'Alcanza 50 puntos', puntos_requeridos: 50 },
    { nombre: 'Experto', descripcion: 'Alcanza 100 puntos', puntos_requeridos: 100 }
  ]);
  console.log('Logros creados');
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
require('dotenv').config();

const express = require('express');
const conectarDB = require('./src/config/db');
const enviosRoutes = require('./src/routes/envios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.get('/', (req, res) => {res.json({ ok: true, mensaje: 'API FastShip funcionando' });});
app.use('/api/envios', enviosRoutes);
app.use((req, res) => {res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });});
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, mensaje: 'El JSON enviado no es válido' });
  }
  console.error(err);
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
});
conectarDB().then(() => {
  app.listen(PORT, () => {console.log(`Servidor escuchando en http://localhost:${PORT}`);});
});
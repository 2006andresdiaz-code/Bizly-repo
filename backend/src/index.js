// src/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas desde la carpeta src/routes
const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const productoRoutes = require('./routes/productoRoutes');
const ventasRoutes = require('./routes/ventasRoutes');
const auditoriaRoutes = require('./routes/auditoriaRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Registrar Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/auditoria', auditoriaRoutes); // <-- Colocado aquí abajo correctamente

// Ruta de prueba general
app.get('/', (req, res) => {
  res.json({ message: '¡Bizly funcionando correctamente!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  
});
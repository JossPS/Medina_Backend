const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 
require('dotenv').config(); 

const productRoutes = require('./routes/product');
const userRoutes = require('./routes/user'); 
const loginRoutes = require('./routes/login'); 

const app = express();
const port = process.env.PORT || 9000;

// Configuración CORS segura
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://medina-admin-frontend.s3-website-us-east-1.amazonaws.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Rutas API
app.use('/api/products', productRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api', userRoutes); 

// Rutas estáticas para servir archivos
app.use('/uploads', express.static(path.join(__dirname, './uploads'))); 
app.use('/cliente', express.static(path.join(__dirname, '../Frontend-Client')));
app.use('/admin', express.static(path.join(__dirname, '../Frontend-admin')));

// Ruta raíz redirige al catálogo
app.get('/', (req, res) => {
  res.redirect('/catalog');
});

// Ruta limpia para el catálogo
app.get('/catalog', (req, res) => {
  res.redirect('/cliente/catalog.html');
});

// Ruta limpia para el panel de administrador
app.get('/admin', (req, res) => {
  res.redirect('/admin/admin.html');
});

// Ruta limpia para login del admin
app.get('/admin-login', (req, res) => {
  res.redirect('/admin/login.html');
});

// Healthcheck para Render
app.get('/health', (_req, res) => res.send('ok'));

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.error(error))

// Iniciar servidor
app.listen(port, () => console.log('Server listening on port', port));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 
require('dotenv').config(); 

const productRoutes = require('./routes/product');
const userRoutes = require('./routes/user'); 
const loginRoutes = require('./routes/login'); 

const app = express();
const port = process.env.PORT || 9000;  // podemos modificar el puerto solo aqui, ahi se actualiza a toda la app

//middleware
app.use(cors()); 
app.use(express.json());

// Rutas API
app.use('/api/products', productRoutes); // Usamos las rutas de producto
app.use('/api/auth', loginRoutes);
app.use('/api', userRoutes); 

//Rutas estáticas para servir archivos
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

// Healthcheck (para Render)
app.get('/health', (_req, res) => res.send('ok'));

//Conection to mongo DB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.error(error))

app.listen(port, () => console.log('Server listening on port', port))
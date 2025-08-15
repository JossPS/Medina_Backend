const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 
require('dotenv').config(); 

const productRoutes = require('./routes/product');
const userRoutes = require('./routes/user'); 
const loginRoutes = require('./routes/login'); 
const verifyToken   = require('./middleware/verifyToken');

const app = express();
const port = process.env.PORT || 9000;  // podemos modificar el puerto solo aqui, ahi se actualiza a toda la app

//middleware
app.use(cors()); 
app.use(express.json());


app.use('/api/products', productRoutes); // Usamos las rutas de producto
app.use('/api/auth', loginRoutes);


app.use('/api', userRoutes); 


app.use('/uploads', express.static(path.join(__dirname, './uploads'))); 
app.use('/cliente', express.static(path.join(__dirname, '../Frontend-Client')));
app.use('/admin', express.static(path.join(__dirname, '../Frontend-admin')));

// Ruta raíz → redirige al cliente
app.get('/', (req, res) => {
  res.redirect('/cliente/catalog.html');
});

// Rutas limpias opcionales
app.get('/login', (req, res) => {
  res.redirect('/admin/login.html');
});

app.get('/admin-panel', (req, res) => {
  res.redirect('/admin/admin.html');
});

// Redirecciones para limpiar la URL
app.get('/admin', (req, res) => {
  res.redirect('/admin');
});

app.get('/login', (req, res) => {
  res.redirect('/login');
});

app.get('/index', (req, res) => {
  res.redirect('/');
});


//Conection to mongo DB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.error(error))

app.listen(port, () => console.log('Server listening on port', port))
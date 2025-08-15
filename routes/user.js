const express = require('express');
const userSchema = require('../models/User'); // Importamos el modelo de usuario
const verifyToken = require('../middleware/verifyToken');
const { verify } = require('jsonwebtoken');
const verifyAdmin = require('../middleware/verifyAdmin'); // Importamos el middleware para verificar si es admin
const router = express.Router();


//create user
router.post('/users',  (req, res) => {
    const user = userSchema(req.body);
    user
    .save()
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

//get all users
router.get('/users', verifyToken, verifyAdmin, (req, res) => {
  userSchema
    .find({}, '-password') // Exclude password field
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

//get a user
router.get('/users/:id', verifyToken, (req, res) => {
    const { id } = req.params;
  userSchema
    .findById(id)
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

//update a user
router.put('/users/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { username, email, password, role} = req.body;
  userSchema
    .updateOne({ _id: id}, { $set: {username, email, password, role} })
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

//delete a user
router.delete('/users/:id', verifyToken, (req, res) => {
    const { id } = req.params;
  userSchema
    .findByIdAndDelete({ _id: id})
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});


//ruta para verificar el token
router.get('/users/verify', verifyToken, (req, res) => {
  res.json({ 
    message: 'Token is valid',
    user: req.user });
});

module.exports = router;

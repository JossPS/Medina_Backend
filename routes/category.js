const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const verifyAdmin = require('../middleware/verifyAdmin');

// Obtener todas las categorías
router.get('/', async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

// Crear nueva categoría
router.post('/', verifyAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Nombre requerido' });

  const exists = await Category.findOne({ name });
  if (exists) return res.status(400).json({ message: 'La categoría ya existe' });

  const newCategory = await Category.create({ name });
  res.status(201).json(newCategory);
});

// Eliminar categoría
router.delete('/:id', verifyAdmin, async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

module.exports = router;

const express = require('express');
const Product = require('../models/product');   
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const router = express.Router();
const multer = require('multer');  
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path'); 

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'veriedades-medina/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
//ruta para obtener todos los productos
router.get('/', async (req, res) => {
  try{
  const products = await Product.find().sort({ createdAt: -1 });
    return res.json(products);
  }catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error fetching products', details: error.message });
  }
  
});

// Crear un nuevo producto
router.post('/', verifyToken, verifyAdmin, upload.single('imageUrl'), async (req, res) => {
  try {
    //  validar código único
    const existingProduct = await Product.findOne({ code: req.body.code });
    if (existingProduct) {
      return res.status(400).json({ error: 'Ya existe un producto con ese código' });
    }

    //  construir producto con URL pública de Cloudinary
    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      code: req.body.code,
      size: req.body.size,
      description: req.body.description,
      stock: req.body.stock,
      promotion: req.body.promotion === 'true',
      imageUrl: req.file?.path,              //  URL pública de Cloudinary
      category: req.body.category
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Error creating product', details: error.message });
  }
});

 
// Actualizar producto
router.put('/:id', verifyToken, verifyAdmin, upload.single('imageUrl'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

   
    if (req.body.code && req.body.code !== product.code) {
      const codeUsedByOther = await Product.findOne({ code: req.body.code, _id: { $ne: req.params.id } });
      if (codeUsedByOther) {
        return res.status(400).json({ error: 'Ya existe otro producto con ese código' });
      }
    }

    product.name = req.body.name ?? product.name;
    product.price = req.body.price ?? product.price;
    product.code = req.body.code ?? product.code;
    product.size = req.body.size ?? product.size;
    product.description = req.body.description ?? product.description;
    product.stock = req.body.stock ?? product.stock; // <- CORREGIDO
    product.promotion = (req.body.promotion !== undefined)
      ? (req.body.promotion === 'true' || req.body.promotion === true)
      : product.promotion;

    if (req.file && req.file.path) {
      product.imageUrl = req.file.path; // nueva URL de Cloudinary
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el producto', details: error.message });
  }
});

// Eliminar producto
router.delete('/:id', verifyToken, verifyAdmin,  async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Error deleting product' });
  }
});

module.exports = router;
const express = require('express');
const Product = require('../models/ProductModel'); 
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Category = require('../models/Category');
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

//  Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    // Devolver solo los campos necesarios al cliente
    const response = products.map(p => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      code: p.code,
      size: p.size,
      description: p.description,
      stock: p.stock,
      promotion: p.promotion,
      category: p.category,
      imageUrl: p.imageUrl  // debe ser URL completa de Cloudinary
    }));

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error fetching products', details: error.message });
  }
});


router.post('/', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    console.log(' req.body:', req.body);
    console.log(' req.file:', req.file);

    //Validar si no llegó imagen
    if (!req.file?.path) {
      return res.status(400).json({ error: 'No se recibió una imagen válida desde Cloudinary' });
    }

    // Validar código único
    const existingProduct = await Product.findOne({ code: req.body.code });
    if (existingProduct) {
      return res.status(400).json({ error: 'Ya existe un producto con ese código' });
    }

     // Validar que la categoría exista
    const categoryExists = await Category.findOne({ name: req.body.category });
    if (!categoryExists) {
      return res.status(400).json({ error: 'Categoría no válida' });
    }

    // Construir producto con URL pública segura
    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      code: req.body.code,
      size: req.body.size,
      description: req.body.description,
      stock: req.body.stock,
      promotion: req.body.promotion === 'true',
      imageUrl: req.file.path,
      category: req.body.category
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(' ERROR AL CREAR PRODUCTO:', error);
    return res.status(400).json({ error: 'Error creating product', details: error.message });
  }
});



router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
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
    product.stock = req.body.stock ?? product.stock;
    product.promotion = (req.body.promotion !== undefined)
      ? (req.body.promotion === 'true' || req.body.promotion === true)
      : product.promotion;

    if (req.file?.path) {
      product.imageUrl = req.file.path;  //  CORREGIDO
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el producto', details: error.message });
  }
});

router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Error deleting product' });
  }
});

module.exports = router;

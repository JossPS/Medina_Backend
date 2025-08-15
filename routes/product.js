const express = require('express');
const Product = require('../models/product');   
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const router = express.Router();
const multer = require('multer');  
const path = require('path'); 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/')); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

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
router.post('/', verifyToken, verifyAdmin,  upload.single('imageUrl'), async (req, res) => {
    try {
      const existingProduct = await Product.findOne({ code: req.body.code });
      if (existingProduct) {
        return res.status(400).json({ error: 'Ya existe un producto con ese código' });
    }
    const newProduct = new Product({
    name: req.body.name,
    price: req.body.price,
    code: req.body.code,
    size: req.body.size,
    description: req.body.description,
    stock: req.body.stock,              
    promotion: req.body.promotion === 'true',
    imageUrl: `uploads/${req.file.filename}`,
    category: req.body.category
  });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Error creating product', details:error.message });
  }
}); 
 
// Actualizar producto
router.put('/:id', verifyToken, verifyAdmin, upload.single('imageUrl'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    product.name = req.body.name;
    product.price = req.body.price;
    product.code = req.body.code;
    product.size = req.body.size;
    product.description = req.body.description;
    product.Stock = req.body.Stock === 'true';
    product.promotion = req.body.promotion === 'true';

    if (req.file) {
      product.imageUrl = `uploads/${req.file.filename}`;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: 'Error updating product' });
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
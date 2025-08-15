const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    size: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    promotion: {
         type: Boolean,
         default: false
    }
    
}, { timestamps: true });

module.exports = mongoose.model('ProductModel', productSchema);
// Exportamos el modelo de producto para usarlo en otras partes de la aplicación
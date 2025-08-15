const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type:String,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
});

///encriptar la contraseña antes de guardar el usuario**//
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});




module.exports = mongoose.model('User', userSchema); //exporta el modelo de datos de usuario
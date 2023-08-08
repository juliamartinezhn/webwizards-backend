var mongoose = require('mongoose');

var esquema = new mongoose.Schema({
    nombre: String,
    apellido: String
});

module.exports = mongoose.model('usuarios',esquema);
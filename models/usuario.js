var mongoose = require('mongoose');
const bcrypt = require('bcrypt');

var esquema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    plan: {
        type: String,
        required: true,
        enum: ['Gratis', 'Plus', 'Avanzado']
    },
    fechaNacimiento: {
        type: Date,
        required: true
    },
});



module.exports = mongoose.model('usuarios',esquema);
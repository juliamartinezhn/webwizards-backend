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
        unique: true, 
        match: /^\S+@\S+\.\S+$/ // Validación básica de formato de correo electrónico
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
    fechaDeNacimiento: {
        type: Date,
        required: true
    },
});

// Antes de guardar, encriptar la contraseña
esquema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const hash = await bcrypt.hash(this.password, 10); // 10 es el número de rondas de hashing
        this.password = hash;
        next();
    } catch (error) {
        return next(error);
    }
});

module.exports = mongoose.model('usuarios',esquema);
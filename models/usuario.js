const mongoose = require('mongoose');

const esquema = new mongoose.Schema({
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
    projectsFolder: {
        type: Object,
        required: true
    },
    totalProjects:Number,
    collaborations: Array
});



module.exports = mongoose.model('usuarios',esquema);
const mongoose = require('mongoose');
const proyectoModel = require('../models/proyecto');

const esquema = new mongoose.Schema({
    nameFolder:
    {
        type: String,
        required: true
    },
    children: Array
});

module.exports = mongoose.model('carpetas', esquema);
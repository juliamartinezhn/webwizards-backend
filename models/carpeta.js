const mongoose = require('mongoose');
const proyectoModel = require('../models/proyecto');

const esquema = new mongoose.Schema({
    nameFolder:
    {
        type: String,
        required: true
    },
    creator: Object,
    created_at:Date,
    children: Array,
    collaborators:Array,
});

module.exports = mongoose.model('carpetas', esquema);
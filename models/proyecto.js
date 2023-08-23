const mongoose = require('mongoose');

const esquema = new mongoose.Schema({
    nameProject:{
        type: String,
        required: true,
    },
    html: String,
    css: String,
    js: String
});


module.exports = mongoose.model('proyectos', esquema);
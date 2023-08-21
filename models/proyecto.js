const mongoose = require('mongoose');

const esquema = new mongoose.Schema({
    nameProject:{
        type: String,
        required: true,
    },
});


module.exports = mongoose.model('proyectos', esquema);
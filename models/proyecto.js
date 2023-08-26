const mongoose = require('mongoose');

const esquema = new mongoose.Schema({
    nameProject:{
        type: String,
        required: true,
    },
    creator: Object,
    created_at:Date,
    modified_at:Date,
    html: String,
    css: String,
    js: String,
    collaborators:Array,
});


module.exports = mongoose.model('proyectos', esquema);
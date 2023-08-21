const mongoose = require('mongoose');

const esquema = new mongoose.Schema({
    tipo: {
        type: String,
        required: true,
        enum: ['proyecto', 'snippet', 'folder']
    },
    content: { 
        type: mongoose.Schema.Types.ObjectId, 
        refPath: 'tipo' 
    },
});


module.exports = mongoose.model('contenidos', esquema);
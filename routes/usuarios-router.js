var express = require('express');
var router = express.Router();
var usuario = require('../models/usuario');

//Crear un usuario
router.post('/', function (req, res) {
    let u = new usuario({
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        email: req.body.email,
        password: req.body.password,
        plan: req.body.plan,
        fechaDeNacimiento: req.body.fechaDeNacimiento
    });
    u.save().then(result => {
        res.send(
            {
                statusCode: 200,
                message: 'El estudiante se ha creado exitosamente.',
                user: result,
            }
        );
        res.end();
    }).catch(error => {
        res.send(error);
        res.end();
    })
});

// //Obtener todos los usuarios
router.get('/', function (req, res) {
    usuario.find().then(result => {
        res.send(
            {
                statusCode: 200,
                message: 'Los estudiantes han sido devueltos exitosamente.',
                user: result,
            }
        );
        res.end();
    }).catch(error => {
        res.send(error);
        res.end();
    });
});

// //Obtener un usuario
router.get('/:id', function (req, res) {
    usuario.find({ _id: req.params.id }).then(result => {
        res.send(
            {
                statusCode: 200,
                message: 'El estudiante ha sido devuelto exitosamente.',
                user: result,
            }
        );
        res.end();
    }).catch(error => {
        res.send(error);
        res.end();
    });
});

module.exports = router;

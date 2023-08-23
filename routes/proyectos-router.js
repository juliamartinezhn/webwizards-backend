const express = require('express');
const router = express.Router();
var mongoose = require('mongoose');
const FolderModel = require('../models/carpeta');
const ProyectoModel = require('../models/proyecto');

// Crear un proyecto dentro de una carpeta
router.post('/carpetas/:carpetaId', async (req, res) => {
    
    try {
        const carpetaId = req.params.carpetaId;
        const nameProject = req.body.nameProject;
        // Buscar la carpeta por ID
        const folder = await FolderModel.findById(carpetaId);
        if (!folder) {
            return res.status(404).json({ message: 'Carpeta no encontrada' });
        }

        // Crear un nuevo proyecto y guardarlo
        const project = new ProyectoModel(
            { 
                nameProject: nameProject,
                html: "",
                css: "",
                js: ""
            }
        );
        await project.save();

        FolderModel.findByIdAndUpdate(
            {
                _id: carpetaId
            },
            {
                $push: {
                    children: {
                        _id: new mongoose.Types.ObjectId(project._id),
                        nameProject: project.nameProject
                    }
                }
            }
        )
            .then(result => console.log(result))
            .catch(error => {
                res.send(error);
                res.end();
            });


        res.send(
            {
                statusCode: 200,
                message: 'Proyecto creada exitosamente',
                newProject: project
            }
        );
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});



//Obtener proyectos 
router.get('/', function (req, res) {
    ProyectoModel.find().then(result => {
        res.send(
            {
                statusCode: 200,
                message: 'Los proyectos han sido devueltos exitosamente.',
                user: result,
            }
        );
        res.end();
    }).catch(error => {
        res.send(error);
        res.end();
    });
})


// Obtener proyectos
router.get('/:proyectoId', function (req, res)  {
    ProyectoModel.find(
        {
            _id: req.params.proyectoId
        }
    ).then(result => {
        res.send(
            {
                statusCode: 200,
                message: 'El proyecto ha sido devuelto exitosamente.',
                project: result[0],
            }
        );
        res.end();
    }).catch(error => {
        res.send(error);
        res.end();
    });
})

// Guardar un proyecto 
router.post('/:proyectoId', async (req, res) => {
    try {
        const { proyectoId } = req.params;

        ProyectoModel.findByIdAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(proyectoId)
            },
            {
                $set: {
                    html: req.body.html,
                    css: req.body.css,
                    js: req.body.js,
                }
            },
            { new: true }
        ).then(result => {
            res.send(
                {
                    statusCode: 200,
                    message: 'Proyecto guardado exitosamente',
                    proyecto: result
                }
            );
            res.end();
        }).catch(error => {
            console.log(error)
            res.send(error);
            res.end();
        });



    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
var mongoose = require('mongoose');
const FolderModel = require('../models/carpeta');
const ProyectoModel = require('../models/proyecto');
const UsuarioModel = require('../models/usuario');

// Crear un proyecto dentro de una carpeta
router.post('/carpetas/:carpetaId/usuarios/:creatorId', async (req, res) => {

    try {

        const creatorId = req.params.creatorId;
        const carpetaId = req.params.carpetaId;
        const nameProject = req.body.nameProject;
        // Buscar la carpeta padre por ID
        const folder = await FolderModel.findById(carpetaId);
        if (!folder) {
            res.send(
                {
                    statusCode: 404,
                    message: 'Carpeta no encontrada'
                }
            );
            res.end();
            return;
        }
        // Buscar al creador del proyecto por ID
        const creator = await UsuarioModel.findById(creatorId);
        if (!creator) {
            res.send(
                {
                    statusCode: 404,
                    message: 'Usuario no encontrado'
                }
            );
            res.end();
            return;
        }
        let { password, plan, fechaNacimiento, projectsFolder, collaborations, totalProjects, ...dataCreator } = await creator.toJSON();

        // LOGICA PARA PLANES
        if (
            (plan === 'Gratis' && totalProjects == 10) ||
            (plan === 'Plus' && totalProjects == 30) ||
            (plan === 'Avanzado' && totalProjects == 70)
        ) {
            res.send(
                {
                    statusCode: 404,
                    message: "Por el plan con el que cuenta, no se pueden crear más proyectos."
                }
            );
            res.end();
            return;
        }

        UsuarioModel.findByIdAndUpdate(
            {
                _id: creatorId
            },
            {
                $inc: {
                    totalProjects: 1
                }
            }
        ).then(async (result) => {
            // Crear un nuevo proyecto y guardarlo
            const project = new ProyectoModel(
                {
                    nameProject: nameProject,
                    creator: dataCreator,
                    created_at: new Date(),
                    modified_at: new Date(),
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
                            nameProject: project.nameProject,
                            creator: project.creator,
                            created_at: project.created_at,
                            modified_at: project.modified_at,
                        }
                    }
                }
            )
                .then(result => {

                    res.send(
                        {
                            statusCode: 200,
                            message: 'Proyecto creado exitosamente',
                            newProject: project
                        }
                    );
                    res.end();
                })
                .catch(error => {
                    res.send(error);
                    res.end();
                });


        }).catch(error => {
            res.send(
                {
                    statusCode: 500,
                    message: error
                }
            );
            res.end();
        })

    } catch (error) {
        res.send(
            {
                statusCode: 500,
                message: 'Error en el servidor'
            }
        );
        res.end();
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

// Obtener un proyecto
router.get('/:proyectoId', function (req, res) {
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
                    modified_at: new Date(),
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
            res.send(
                {
                    statusCode: 500,
                    message: 'Error en el servidor'
                }
            );
            res.end();
        });



    } catch (error) {
        res.send(
            {
                statusCode: 500,
                message: 'Error en el servidor'
            }
        );
        res.end();
    }
});

// Añadir colaborador a un proyecto 
router.get('/:proyectoId/usuarios/:collabId', async (req, res) => {

    try {
        const collabId = req.params.collabId;
        const proyectoId = req.params.proyectoId;
        // Buscar al collaborador del proyecto por ID
        const collaborator = await UsuarioModel.findById(collabId);
        if (!collaborator) {
            res.send(
                {
                    statusCode: 404,
                    message: 'Usuario no encontrado'
                }
            );
            res.end();
            return;
        }


        // Buscar el proyecto por ID
        const proyecto = await ProyectoModel.findById(proyectoId);
        if (!proyecto) {
            res.send(
                {
                    statusCode: 404,
                    message: 'Proyecto no encontrado'
                }
            );
            res.end();
            return;
        }

        if (proyecto.creator._id.toString() === collabId) {
            res.send(
                {
                    statusCode: 400,
                    message: 'Este usuario es el creador'
                }
            );
            res.end();
            return;
        }

        // Verificar si el colaborador ya existe en la lista de colaboradores
        const existeColaborador = proyecto.collaborators.some((colaborador) => {
            return colaborador._id.toString() === collabId;
        });

        if (existeColaborador) {
            res.send(
                {
                    statusCode: 400,
                    message: 'El colaborador ya esta en el proyecto'
                }
            );
            res.end();
            return;
        }

        let { password, plan, fechaNacimiento, projectsFolder, collaborations, ...dataCollab } = await collaborator.toJSON();


        ProyectoModel.findByIdAndUpdate(
            {
                _id: proyectoId
            },
            {
                $push: {
                    collaborators: dataCollab
                }
            }
        )
            .then(async (result) => {

                let { password, plan, fechaNacimiento, projectsFolder, collaborations, ...dataCreator } = await proyecto.creator;

                UsuarioModel.findByIdAndUpdate(
                    {
                        _id: collabId
                    },
                    {
                        $push: {
                            collaborations: {
                                _id: new mongoose.Types.ObjectId(proyecto._id),
                                nameProject: proyecto.nameProject,
                                creator: dataCreator
                            }
                        }

                    }
                )
                    .then((result) => {

                        res.send(
                            {
                                statusCode: 200,
                                message: 'Colaborador añadido al proyecto exitosamente',
                                newCollab: dataCollab
                            }
                        );
                        res.end();


                    })
                    .catch(error => {
                        res.send(error);
                        res.end();
                    });



            })
            .catch(error => {
                res.send(error);
                res.end();
            });



    } catch (error) {

        res.send(
            {
                statusCode: 500,
                message: 'Error en el servidor'
            }
        );
        res.end();
    }
});


// Obtener las colaboraciones de un usuario
router.get('/usuarios/:usuarioId', async (req, res) => {


    UsuarioModel.find(
        {
            _id: req.params.usuarioId
        }
    ).then(result => {

        res.send(
            {
                statusCode: 200,
                message: 'Las colaboraciones del usuario han sido devueltas exitosamente.',
                colaboraciones: result[0].collaborations,
            }
        );
        res.end();

    }).catch(error => {
        res.send(
            {
                statusCode: 500,
                message: 'Error en el servidor'
            }
        );
        res.end();
    });


});

// Obtener ultimos 3 proyectos de un usuario
router.get('/usuarios/:usuarioId/ultimos', async (req, res) => {
  
    try {
        const proyectos = await ProyectoModel
            .find({ "creator._id": new mongoose.Types.ObjectId(req.params.usuarioId) })
            .sort({ modified_at: -1 }) // Ordenar por fecha de modificación descendente
            .limit(3); // Limitar a los últimos 3 proyectos
        res.send(
            {
                statusCode: 200,
                message: 'Los últimos proyectos modificados del usuario han sido devueltos exitosamente.',
                proyectos: proyectos,
            }
        );
        res.end();
    } catch (error) {
        console.error(error);
        res.send(
            {
                statusCode: 500,
                message: 'Error al obtener los últimos proyectos modificados del usuario.'
            }
        );
        res.end();
        
    }

});


module.exports = router;




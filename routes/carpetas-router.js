const express = require('express');
const router = express.Router();
var mongoose = require('mongoose');
const FolderModel = require('../models/carpeta');
const ProyectoModel = require('../models/proyecto');
const UsuarioModel = require('../models/usuario');


//Obtener carpetas 
router.get('/', function (req, res) {
    FolderModel.find().then(result => {
        res.send(
            {
                statusCode: 200,
                message: 'Los folders han sido devueltos exitosamente.',
                user: result,
            }
        );
        res.end();
    }).catch(error => {
        res.send(error);
        res.end();
    });
})

// Crear una carpeta
router.post('/:idCarpetaPadre/usuarios/:creatorId', async (req, res) => {
    const { nameFolder } = req.body;
    const { idCarpetaPadre, creatorId } = req.params;

    // Buscar al creador de la carpeta por ID
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

    const folder = await FolderModel.findById(idCarpetaPadre);
    if (!folder) {
        res.send(
            {
                statusCode: 404,
                message: 'Carpeta padre no encontrada'
            }
        );
        res.end();
        return;
    }

    let { password, plan, fechaNacimiento, projectsFolder, collaborations, ...dataCreator } = await creator.toJSON();
    
    const newFolder = new FolderModel({
        nameFolder: nameFolder,
        creator: dataCreator,
        created_at: new Date()
    });
    await newFolder.save();

    FolderModel.findByIdAndUpdate(
        {
            _id: idCarpetaPadre
        },
        {
            $push: {
                children: {
                    _id: new mongoose.Types.ObjectId(newFolder._id),
                    nameFolder: newFolder.nameFolder,
                    creator: newFolder.dataCreator,
                    created_at: newFolder.created_at,
                    children: []
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
            message: 'Carpeta creada exitosamente',
            newFolder: newFolder
        }
    );
    res.end();
});

//Obtener folders hijos de un folder padre
router.get('/hijos/:idFolderPadre', async function (req, res) {

    const { idFolderPadre } = req.params;
    console.log(idFolderPadre)
    try {
        FolderModel.find(
            {
                _id: idFolderPadre
            })
            .then(result => {
                console.log(result);
                res.send(
                    {
                        statusCode: 200,
                        message: 'Los hijos de la carpeta han sido devueltos.',
                        children: result[0].children
                    }
                );

                res.end();


            }).catch(error => {
                console.log(error);
            });



    } catch (error) {

        res.status(500).send('Error interno del servidor');
    }



})

// Añadir colaborador a un carpeta 
router.get('/:carpetaId/usuarios/:collabId', async (req, res) => {

    try {
        const collabId = req.params.collabId;
        const carpetaId = req.params.carpetaId;
        // Buscar al collaborador de la carpeta por ID
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


        // Buscar la carpeta por ID
        const carpeta = await CarpetaModel.findById(carpetaId);
        if (!carpeta) {
            res.send(
                {
                    statusCode: 404,
                    message: 'Carpeta no encontrada'
                }
            );
            res.end();
            return;
        }

        if (carpeta.creator._id.toString() === collabId) {
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
        const existeColaborador = carpeta.collaborators.some((colaborador) => {
            return colaborador._id.toString() === collabId;
        });

        if (existeColaborador) {
            res.send(
                {
                    statusCode: 400,
                    message: 'El colaborador ya esta en la carpeta'
                }
            );
            res.end();
            return;
        }

        let { password, plan, fechaNacimiento, projectsFolder, collaborations, ...dataCollab } = await collaborator.toJSON();


        CarpetaModel.findByIdAndUpdate(
            {
                _id: carpetaId
            },
            {
                $push: {
                    collaborators: dataCollab
                }
            }
        )
            .then(async (result) => {

                let { password, plan, fechaNacimiento, projectsFolder, collaborations, ...dataCreator } = await carpeta.creator;

                UsuarioModel.findByIdAndUpdate(
                    {
                        _id: collabId
                    },
                    {
                        $push: {
                            collaborations: {
                                _id: new mongoose.Types.ObjectId(carpeta._id),
                                nameFolder: carpeta.nameFolder,
                                creator: dataCreator
                            }
                        }

                    }
                )
                    .then((result) => {

                        res.send(
                            {
                                statusCode: 200,
                                message: 'Colaborador añadido a la carpeta exitosamente',
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
    console.log(req.params.usuarioId)

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



module.exports = router;
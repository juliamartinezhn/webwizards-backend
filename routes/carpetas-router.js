const express = require('express');
const router = express.Router();
var mongoose = require('mongoose');
const FolderModel = require('../models/carpeta');


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
router.post('/:idCarpetaPadre', async (req, res) => {
    const { nameFolder } = req.body;
    const { idCarpetaPadre } = req.params;
console.log(nameFolder)
console.log(idCarpetaPadre)
    let f = { nameFolder: nameFolder };
    let folder;
    if (idCarpetaPadre) {
        folder = await FolderModel.findById(idCarpetaPadre);
        if (!folder) {
            return res.status(404).json({ message: 'Carpeta no encontrada' });
        }
    }

    const newFolder = new FolderModel(f);
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



module.exports = router;
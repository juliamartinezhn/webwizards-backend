const express = require('express');
const router = express.Router();
const folderModel = require('../models/carpeta');
const content = require('../models/contenido');
const proyectoModel = require('../models/proyecto');

// Endpoint para crear un proyecto dentro de una carpeta
router.post('/carpetas/:carpetaId', async (req, res) => {
    try {
        const { carpetaId } = req.params;
        const { nameProject } = req.body;

        // Buscar la carpeta por ID
        const folder = await folderModel.findById(carpetaId);
        if (!folder) {
            return res.status(404).json({ message: 'Carpeta no encontrada' });
        }

        // Crear un nuevo proyecto y guardarlo
        const project = new proyectoModel({ nameProject });
        await project.save();

        

        // Crear un ContentItem para el proyecto
        // const contentItem = new content({ tipo: 'proyecto', content: project._id });
        // await contentItem.save();

        // Agregar el proyecto a la carpeta y guardar la carpeta
        // console.log(contentItem);
        folder.children.push(project);
        await folder.save();

        res.status(201).json({ message: 'Proyecto creado en la carpeta', project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

//Obtener folders con proyectos
// router.get('/', function (req, res)  {
//     FolderModel.find().then(result => {
//         let projects = result.map()
//         res.send(
//             {
//                 statusCode: 200,
//                 message: 'Los folders han sido devueltos exitosamente.',
//                 projects: result,
//             }
//         );
//         res.end();
//     }).catch(error => {
//         res.send(error);
//         res.end();
//     });
// })

module.exports = router;
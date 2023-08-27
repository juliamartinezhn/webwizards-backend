var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var usuario = require('../models/usuario');
const FolderModel = require('../models/carpeta');

const SECRET_KEY = "NOTESAPI";

//Crear un usuario
router.post('/', function (req, res) {

    let { nombre, apellido, email, password, plan, fechaNacimiento } = req.body;
    nombre = nombre.trim();
    apellido = apellido.trim();
    email = email.trim();
    password = password.trim();
    plan = plan.trim();
    fechaNacimiento = fechaNacimiento.trim();

    if (nombre === "" || apellido === "" || email === "" || password === "" || plan === "" || fechaNacimiento === "") {
        res.send(
            {
                statusCode: 404,
                message: 'Campos en blanco.'
            }
        );
        res.end();
    } else if (!/^[a-zA-Z ]*$/.test(nombre)) {
        res.send(
            {
                statusCode: 404,
                message: 'Nombre inválido.'
            }
        );
        res.end();
    } else if (!/^[a-zA-Z ]*$/.test(apellido)) {
        res.send(
            {
                statusCode: 404,
                message: 'Apellido inválido.'
            }
        );
        res.end();
    } else if (!/^(([^<>()[\]\\.,;:\s@']+(\.[^<>()\\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
        res.send(
            {
                statusCode: 404,
                message: 'Email inválido.'
            }
        );
        res.end();
    } else if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&()\-_=+{};:,<.>])(?!.*\s).{8,}$/.test(password)) {
        res.send(
            {
                statusCode: 404,
                message: 'Contraseña inválida.'
            }
        );
        res.end();
    } else if (plan !== "Gratis" && plan !== "Plus" & plan !== "Avanzado") {
        res.send(
            {
                statusCode: 404,
                message: 'Plan inválido.'
            }
        );
        res.end();
    } else if (!new Date(fechaNacimiento).getTime()) {
        res.send(
            {
                statusCode: 404,
                message: 'Fecha de nacimiento inválida.'
            }
        );
        res.end();
    } else {
        usuario.find({ email }).then(result => {
            if (result.length) {

                res.send(
                    {
                        statusCode: 400,
                        message: 'Usuario ya existe.'
                    }
                );
                res.end();
            } else {
                bcrypt.hash(password, 10).then(async hashedPassword => {
                    let projectFolder = new FolderModel({ 
                        nameFolder: "Unidad Proyectos",
                        created_at: new Date()
                    });
                    await projectFolder.save();

                    let u = await new usuario({
                        nombre: nombre,
                        apellido: apellido,
                        email: email,
                        password: hashedPassword,
                        plan: plan,
                        fechaNacimiento: fechaNacimiento,
                        projectsFolder: projectFolder,
                        totalProjects:0
                    });


                    u.save().then(result => {
                        const token = jwt.sign({ email: u.email, _id: u._id }, SECRET_KEY);
                        res.cookie("jwt", token, {
                            httpOnly: true,
                            maxAge: 24 * 60 * 60 * 1000,
                            sameSite: "None", 
                            secure: true
                        })
                        res.send(
                            {
                                statusCode: 200,
                                message: 'El usuario se ha creado exitosamente.',
                                user: result,
                                token: token
                            }
                        );

                        res.end();
                    }).catch(error => {

                        res.send(
                            {
                                statusCode: 404,
                                message: 'Error al guardar usuario.'
                            }
                        );
                        res.end();
                    })
                }).catch(err => {
                    res.send(
                        {
                            statusCode: 404,
                            message: 'Error al hash de la contraseña.'
                        }
                    );
                    res.end();
                })

            }

        }).catch(error => {

            res.send(
                {
                    statusCode: 404,
                    message: 'Error al buscar usuario.'
                }
            );
            res.end();
        })
    }
});


router.post('/login', async function (req, res) {
    
    const u = await usuario.findOne({ email: req.body.email })
    
    if (!u) {
        res.send(
            {
                statusCode: 401,
                message: 'Usuario no encontrado.'
            }
        );
        res.end();
    } else {
        
        
        
        bcrypt.compare(req.body.password, u.password)
            .then(result => {
                
                const token = jwt.sign({ _id: u._id }, SECRET_KEY);
                
                
                res.cookie("jwt", token, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000,
                    sameSite: "None", 
                    secure: true
                });

                res.send(
                    {
                        statusCode: 200,
                        message: 'El usuario ha iniciado sesión.'
                    }
                );

                res.end();
            }).catch(error => {
                res.send(
                    {
                        statusCode: 400,
                        message: 'Credenciales invalidas.'
                    }
                );
                
                res.end();
            });

    }
});

// Cerrar sesion de un usuario
router.post('/cerrar-sesion', function (req, res) {

    res.cookie("jwt", "", { maxAge: 0 });
    res.send({
        statusCode: 200,
        message: "El usuario ha cerrado sesión."
    });
    res.end();

});

// Obtener info del usuario loggeado
router.get('/autenticado', async function (req, res) {
    try {

        const cookie = req.cookies['jwt'];

        const logged = jwt.verify(cookie, SECRET_KEY);
        if (!logged) {

            res.send(
                {
                    statusCode: 401,
                    message: 'Usuario no autenticado.'
                }
            );
            res.end();

        } else {
            const u = await usuario.findOne({ _id: logged._id });

            const { password, ...data } = await u.toJSON();

            res.send(data);
            res.end();
        }
    } catch (error) {

        res.send(
            {
                statusCode: 401,
                message: 'Usuario no autenticado.'
            }
        );
        res.end();
    }
});


// //Obtener todos los usuarios
router.get('/', function (req, res) {
    usuario.find().then(result => {
        res.send(
            {
                statusCode: 200,
                message: 'Los usuarios han sido devueltos exitosamente.',
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
                message: 'El usuario ha sido devuelto exitosamente.',
                user: result,
            }
        );
        res.end();
    }).catch(error => {
        res.send(error);
        res.end();
    });
});

// Cambiar plan del usuario
router.post('/:usuarioId', async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const { nuevoPlan } = req.body;

        usuario.findByIdAndUpdate(
            {
                _id: usuarioId
            },
            {
                $set: {
                    plan: nuevoPlan
                }
            },
            { new: true }
        ).then(result => {
            
            res.send(
                {
                    statusCode: 200,
                    message: 'Plan actualizado correctamente exitosamente',
                    usuario: result
                }
            );
            res.end();
        }).catch(error => {
            res.send(
                {
                    statusCode: 500,
                    message: 'Error al actualizar plan del usuario'
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


module.exports = router;


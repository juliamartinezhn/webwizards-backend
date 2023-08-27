var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var database = require('./modules/database');
var usuariosRouter = require('./routes/usuarios-router');
var carpetasRouter = require('./routes/carpetas-router');
var proyectosRouter = require('./routes/proyectos-router');

var app = express();
app.use(
    cors({
      origin: 'https://webwizards-frontend-phi.vercel.app',
      // origin: 'http://localhost:4200', 
      credentials: true, // Allow credentials (cookies)
    })
  );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/usuarios', usuariosRouter);
app.use('/carpetas', carpetasRouter);
app.use('/proyectos', proyectosRouter);


//Starting server
app.listen(8888, function () {
    console.log("Servidor levantado");
});

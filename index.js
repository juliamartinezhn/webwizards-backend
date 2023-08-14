var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var database = require('./modules/database');
var database = require('./modules/database');
var usuariosRouter = require('./routes/usuarios-router');

var app = express();

// app.use(cors());
app.use(
    cors({
      origin: 'http://localhost:4200', // Replace with your frontend's URL
      credentials: true, // Allow credentials (cookies)
    })
  );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/usuarios', usuariosRouter);


//Starting server
app.listen(8888, function () {
    console.log("Servidor levantado");
});

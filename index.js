var express = require('express');
var bodyParser = require('body-parser');
var database = require('./modules/database');
var cors = require('cors');
var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//Starting server
app.listen(8888, function () {
    console.log("Servidor levantado");
});

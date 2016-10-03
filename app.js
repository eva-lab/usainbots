var express     = require('express');
var bodyParser  = require('body-parser');
var app         = express();
var loader      = require('./lib/loader');

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));

//
loader("controllers", function (files){
  for (var i = 0; i < files.length; i++) {
    app.use(require(files[i]));
  }
});

// Estartando o Serviço
app.listen(8080, function () {
  console.log('Service ON');
});
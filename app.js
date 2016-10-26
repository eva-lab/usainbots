var express       = require('express'),
    bodyParser    = require('body-parser'),
    app           = express(),
    loader        = require('./lib/loader'),
    cookieParser  = require('cookie-parser'),
    mongoose      = require('mongoose'),
    config        = require('./config/config');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Control Access Origin
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*'); //TODO: Ajustar para aceitar apenas as aplicações com permissão
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Require 'Controllers' => app.use
loader.loadRequire("controllers", function (files){
  for (var i = 0; i < files.length; i++) {
    app.use(require(files[i]));
  }
});

// Connect Mongodb
mongoose.Promise = global.Promise;
mongoose.connect(config.bd.host + config.bd.name, function(err){
  if(err){
    console.log('Não foi possível conectar ao banco de dados');
    return;
  }
});

// Start o Service
app.listen(8080, function () {
  console.log('Service ON');
});

var express       = require('express'),
    app           = express(),
    bodyParser    = require('body-parser'),
    cookieParser  = require('cookie-parser'),
    mongoose      = require('mongoose'),
    loader        = require('./lib/loader'),
    cronjobs      = require('./lib/cronjobs'),
    Config        = require('./config');

(function initApp () {

    var config = Config.env();

    if(config && config == ""){

      console.log("# ambiente não foi setado");
      return;

    } else {

      app.use(cookieParser());
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));

      // TODO
      app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
      });

      loadControllers();
      loadDB(config);

      app.listen(config.port, function () {
        console.log('# seviço rodando na porta ' + config.port);
      });

      cronjobs.start();

    }

})();

function loadControllers(){
  loader.loadRequire("src/controllers", function (files){
    for (var i = 0; i < files.length; i++) {
      app.use(require(files[i]));
    }
  });
}

function loadDB (config) {

  mongoose.Promise = global.Promise;
  mongoose.connect(config.bd.host + config.bd.name, function(err){
    if(err){
      console.log('# não foi possível conectar ao banco de dados');
      return;
    } else {
      console.log('# banco de dados conectado.')
    }
  });

}

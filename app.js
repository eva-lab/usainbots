var express       = require('express'),
    app           = express(),
    bodyParser    = require('body-parser'),
    cookieParser  = require('cookie-parser'),
    mongoose      = require('mongoose'),
    Config        = require('./config'),
    loader        = require('./core/loader');

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

      loadDB(config);

      app.listen(config.port, function () {
        console.log('# seviço rodando na porta ' + config.port);
      });

      var load  = loader.init();
      for (var i = 0; i < load.length; i++) {
        app.use(require(load[i]));
      }

    }

})();

function loadDB (config) {

  mongoose.Promise = global.Promise;
  mongoose.connect("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.host + ":" + config.db.port + "/" + config.db.name,

  function(err){

    if(err){
      console.log('# não foi possível conectar ao banco de dados');
      return;
    } else {
      console.log('# banco de dados conectado.')
    }
  });

}

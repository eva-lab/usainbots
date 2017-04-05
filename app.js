var express       = require('express'),
    app           = express(),
    bodyParser    = require('body-parser'),
    mongoose      = require('mongoose'),
    Config        = require('./config/config'),
    loader        = require('./src/libs/loader'),
    addons        = require('./addons/addons.json');

(function initApp () {

    var config = Config.env();

    if(config && config == "") {

      console.log("# ambiente não foi setado");
      return;

    } else {

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

      // Load CronJobs
      for(let i = 0; i < addons.modules.length; i++) {
        if(addons.modules[i].cronjob) {
          require('./addons/' + addons.modules[i].name).main();
        }
      }

      loadDB(config);

      app.use(errorHandler);

      let load  = loader.load(["controllers"]);
      for (let i = 0; i < load.length; i++) {
        app.use(require(load[i]));
      }

      app.listen(config.port, function () {
        console.log('# seviço rodando na porta ' + config.port);
      });

    }

})();

function loadDB (config) {

  mongoose.Promise = global.Promise;
  mongoose.connect("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.host + ":" + config.db.port + "/" + config.db.name,

  function(err){

    if(err) {
      console.log('# não foi possível conectar ao banco de dados');
      return;
    } else {
      console.log('# banco de dados conectado.')
    }
  });

}

function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}

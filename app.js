var express     = require('express'),
    bodyParser  = require('body-parser'),
    app         = express(),
    loader      = require('./lib/loader'),
    mongoose    = require('mongoose');

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));

//
loader("controllers", function (files){
  for (var i = 0; i < files.length; i++) {
    app.use(require(files[i]));
  }
});

// Connect Mongodb
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/usainbot', function(err){
    if(err){
      console.log('Não foi possível conectar ao banco de dados');
      return;
    }
});

// Start o Service
app.listen(8080, function () {
  console.log('Service ON');
});

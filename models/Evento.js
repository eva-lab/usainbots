var mongoose  = require('mongoose'),
    exports   = module.exports;

var eventoSchema = new mongoose.Schema({
  idBot:          { type: String, require: true },
  titulo:         { type: String, require: true },
  data:           { type: Date,   require: true },
  uri:            { type: String, require: true }
});

var Evento =  mongoose.model('Evento', eventoSchema);

exports.cadastrar = function(dados, callback) {

  Evento.remove({}, function(err){
    if(err) return;
    Evento.insertMany(dados, function(err, eventos){
      if(err){
        callback(true);
        return;
      }
      callback(false, eventos);
    });
  });

};

exports.pegar = function(callback) {

  Evento.find({}, function(err, eventos){

    if (!eventos || err){
      callback(true);
    } else {
      callback(false, eventos);
    }

  });

};

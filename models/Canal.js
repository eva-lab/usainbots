var mongoose        = require('mongoose'),
    exports         = module.exports;

var canalSchema = new mongoose.Schema({
  idBot:  { type: String, require: true },
  nome:   { type: String, require: true },
  tipo:   { type: String, default: null },
  endereco:   { type: String, default: null },
  dataCriacao:  { type: Date, require: true },
  ultimaColeta: { type: Date, require: true }
});

var feedSchema = new mongoose.Schema({
    idCanal:      { type: String },
    titulo:       { type: String },
    conteudo:     { type: String },
    tags: {
      titulo: [ String ],
      conteudo: [ String ]
    }
});

var Canal =  mongoose.model('Canal', canalSchema);
var Feed =  mongoose.model('Feed', feedSchema);

exports.cadastrarCanal = function(dados, callback) {
  Canal.insertMany(dados, function(err, canal){
    if(err){
      callback(true);
      return;
    }
    callback(false, canal);
  });
};

exports.cadastrarFeeds = function(dados, callback) {
  Feed.insertMany(dados, function(err, feeds){
    if(err){
      callback(true);
      return;
    }
    callback(false, feeds);
  });
}

exports.buscarCanal = function(dados, callback) {};

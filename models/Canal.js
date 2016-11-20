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

exports.consultarPeloIdBot = function(dados, callback) {

  Canal.find({ 'idBot': dados.idBot }).select('_id').exec(function(err, canais) {

    if (!canais || err) {
      callback(true);
      return;
    }

    var ids = [];
    for (var i = 0; i < canais.length; i++) {
      ids.push(canais[i]._id);
    }

    Feed.find({
      'idCanal': { $in: ids },
      $or: [
        { 'tags.titulo' : { $in: dados.query } },
        { 'tags.conteudo' : { $in: dados.query } }
      ]
    })
    .select('tags.titulo tags.conteudo conteudo')
    .exec(function(err, feeds){
      console.log(feeds);
      if (!feeds || err) {
        callback(true);
        return;
      }
      callback(false, feeds);
    });

  });

};

var mongoose        = require('mongoose'),
    exports         = module.exports;

var canalSchema = new mongoose.Schema({
  idBot:  { type: String, require: true },
  nome:   { type: String, default: null },
  tipo:   { type: String, default: null },
  uri:   { type: String, default: null },
  dataCriacao:  { type: Date, require: true },
  ultimaColeta: { type: Date, require: true }
});

var documentSchema = new mongoose.Schema({
    idCanal:      { type: String },
    titulo:       { type: String },
    conteudo:     [ String ],
    tags: {
      titulo:   [ String ],
      conteudo: []
    }
});

var Canal     =  mongoose.model('Canal', canalSchema);
var Document  =  mongoose.model('Document', documentSchema);

exports.cadastrarCanal = function(dados, callback) {
  Canal.insertMany(dados, function(err, canal){
    if(err){
      callback(true);
      return;
    }
    callback(false, canal);
  });
};

exports.cadastrarDocuments = function(dados, callback) {
  Document.insertMany(dados, function(err, documents){
    if(err){
      callback(true);
      return;
    }
    callback(false, documents);
  });
}

exports.consultarPeloIdBot = function(dados, callback) {

  Canal.find({ 'idBot': dados.idBot }).exec(function(err, canais) {

    if (!canais || err) {
      callback(true);
      return;
    }

    var ids = [];
    for (var i = 0; i < canais.length; i++) {
      ids.push(canais[i]._id);
    }

    Document.find({
     $and: [
       {'idCanal': { $in: ids }},
       {
         $or: [
           {'tags.titulo': { $in: dados.query }},
           {'tags.conteudo': { $in: dados.query }}
         ]
       }
     ]
   }, function (err, documents) {

     if (!documents || err) {
         callback(true);
         return;
       }
       callback(false, documents);
   });


  });

};

exports.getAllChannels = function (callback) {
  Canal.find().select('_id tipo uri').exec(function(err, channels) {

    if (!channels || err) {
      callback(true);
      return;
    }

    callback(false, channels);

  });
}

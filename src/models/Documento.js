var mongoose        = require('mongoose'),
    random          = require('mongoose-random'),
    ObjectId        = mongoose.Schema.Types.ObjectId;
    exports         = module.exports;

var documentoSchema = new mongoose.Schema({
  idBot:        { type: ObjectId },
  tipo:         { type: String },
  uri:          { type: String },
  seletor:      { type: String },
  titulo:       { type: String },
  conteudo:     [ String ],
  tags: {
    titulo:   [],
    conteudo: []
  },
  data:  { type: Date, require: true }
});

documentoSchema.plugin(random, { path: 'r' });

var Documento  =  mongoose.model('Documento', documentoSchema);

exports.cadastrarDocumento = function(dados, callback) {

  Documento.insertMany(dados, function(err, documentos) {
    if(err){
      callback(true);
      return;
    }
    var dados = [];
    for (var i = 0; i < documentos.length; i++) {
      dados.push({
        idBot:    documentos[i].idBot,
        tipo:     documentos[i].tipo,
        uri:      documentos[i].uri,
        seletor:  documentos[i].seletor,
        titulo:   documentos[i].titulo,
        conteudo: documentos[i].conteudo,
        tags:     documentos[i].tags
      });
    }
    callback(false, dados);
  });

};

exports.consultarPeloIdBot = function(dados, cb) {

  Documento.find({
    $and: [
      { 'idBot': dados.bot._id },
      {
        $or: [
        {
          'tags.titulo':{ $in: dados.query }
        },
        {
          'tags.conteudo':{
            $elemMatch:{
              $elemMatch:{
                $in: dados.query
              }
            }
          }
        }
        ]
      }
    ]
  }, function (err, documentos) {

    if (!documentos || err) {
      return cb(true);
    }
    cb(false, documentos);

  });

};

exports.consultarRandom = function(idBot, callback){

  var filter = { idBot: idBot };
  var fields = { titulo: 1, _id: 0 };
  var options = { skip: 2, limit: 4 };

  Documento.findRandom(filter, fields, options, function (err, documentos) {
    if(err) return callback(true);
    callback(false, documentos);
  });

};

exports.consultarPeloTipo = function(tipo, cb) {

  Documento.find({ tipo: tipo }, "tipo titulo uri conteudo data", function (err, documentos) {

    if (!documentos || err) {
      return cb(true);
    }
    
    cb(false, documentos);

  });

};
var mongoose  = require('mongoose'),
    exports   = module.exports;

var noticiaSchema = new mongoose.Schema({
  idBot:          { type: String, require: true },
  titulo:         { type: String, require: true },
  resumo:         { type: String, require: true },
  uri:            { type: String, require: true }
});

var Noticia =  mongoose.model('Noticia', noticiaSchema);

exports.cadastrar = function(dados, callback) {

  Noticia.remove({}, function(err){
    if(err) return;
    Noticia.insertMany(dados, function(err, noticias){
      if(err){
        callback(true);
        return;
      }
      callback(false, noticias);
    });
  });

};

exports.pegar = function(callback) {

  Noticia.find({}, function(err, noticias){

    if (!noticias || err){
      callback(true);
    } else {
      callback(false, noticias);
    }

  });

};

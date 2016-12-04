var mongoose        = require('mongoose'),
    exports         = module.exports;

var documentoSchema = new mongoose.Schema({
  idBot:        { type: String, require: true },
  tipo:         { type: String, require: true },
  uri:          { type: String },
  selector:     { type: String },
  titulo:       { type: String },
  conteudo:     [ String ],
  tags: {
    titulo:   [ String ],
    conteudo: []
  },
  dataCriacao:  { type: Date, require: true },
  ultimaColeta: { type: Date, require: true }
});

var Documento  =  mongoose.model('Documento', documentoSchema);

exports.cadastrarDocumento = function(dados, callback) {

  Documento.insertMany(dados, function(err, documentos){
    if(err){
      callback(true);
      return;
    }
    callback(false, documentos);
  });
  
}

exports.consultarPeloIdBot = function(dados, callback) {

    Documento.find({
     $and: [
       { 'idBot': dados.idBot },
       {
         $or: [
          { 'tags.titulo': { $in: dados.query } },
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
         callback(true);
         return;
       }
       callback(false, documentos);
   });

};

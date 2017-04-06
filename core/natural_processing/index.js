var exports     = module.exports,
    Classifier  = require('./classifier'),
    Extractor   = require('./extractor'),
    Weighter    = require('./weight'),
    addons      = require('../../addons/addons.json'),
    rn                = require('random-number'),
    Documento         = require('../../src/models/Documento');

exports.init = function(data, done) {

  let queryOriginal = data.query;

  let random    = null;
  let resposta  = null;

  data.query = Extractor.extract(queryOriginal, { stemmering: true, lowercase: true, accent: true });

  let classify = Classifier.classify(data.query);

  console.log(classify);

  switch (classify) {

    case "questionamento":

      data.query = Extractor.extract(queryOriginal)[0];

      Documento.consultarPeloIdBot(data, function(err, documentos) {

        if (err) {

          done(true, { err: 500} );

        } else if(!documentos || documentos == "") {
          Documento.consultarRandom(data.bot._id, function(err, documentos) {
            resposta = respostaRandom(data.bot.frases.semResposta);
            resposta = resposta + "\n" + respostaRandom(data.bot.frases.engajamento);
            done(false, { resposta: resposta, sugestoes: documentos || [] });
          });
        } else {
          // com resposta
          resposta = Weighter.weightDocuments({ documents: documentos, query: data.query });
          Documento.consultarRandom(data.bot._id, function(err, documentos) {
            done(false, { resposta: resposta, sugestoes: documentos || [] });
          });
        }
      });

      break;

    case "apresentacao":
    case "agradecimento":
    case "encerramento":
    case "abertura":

      let tipo = "apresentacao";

      if (classify == "agradecimento") {
        tipo = data.bot.frases.agradecimento;
      } else if(classify == "encerramento") {
        tipo = data.bot.frases.encerramento;
      } else {
        tipo = data.bot.frases.abertura;
      }

      resposta = respostaRandom(tipo);
      done(false, { resposta: resposta });
      break;

    case "cinNews":

      Documento.consultarPeloTipo('cinNews', function(err, documentos) {
        if(err) return done(true, {});
        done(false, { resposta: documentos });
      });
      break;

    case "cinEvents":

      Documento.consultarPeloTipo('cinEvents', function(err, documentos) {
        if(err) return done(true, {});
        done(false, { resposta: documentos });
      });
      break;

    default:
      Documento.consultarRandom(data.bot._id, function(err, documentos) {
        resposta = respostaRandom(data.bot.frases.semResposta);
        resposta = resposta + "\n" + respostaRandom(data.bot.frases.engajamento);
        done(false, { resposta: resposta, sugestoes: documentos || [] });
      });

  }

}

function respostaRandom (sentenca) {

  let random = rn({ min: 0, max: sentenca.length-1, integer: true });

  return sentenca[random];

}
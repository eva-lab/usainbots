var natural               = require('natural'),
    moment                = require('moment'),
    PortugueseStemmer     = require('snowball-stemmer.jsx/dest/portuguese-stemmer.common.min.js').PortugueseStemmer,
    stopwords             = require("keyword-extractor"),
    exports               = module.exports;


function removeAceents (query){
  var expression = null;

  var lettersMap 	= {
    a : /[\xE0-\xE6]/g,
    e : /[\xE8-\xEB]/g,
    i : /[\xEC-\xEF]/g,
    o : /[\xF2-\xF6]/g,
    u : /[\xF9-\xFC]/g,
    c : /\xE7/g,
    n : /\xF1/g
  };

  for (var letter in lettersMap) {
    expression = lettersMap[letter];
    query = query.replace(expression, letter);
  }

  return query;
}

exports.processQuery  = function (query, options){

  var config        =  {};
  var tokenizer     = new natural.WordTokenizer();
  var stemmer       = new PortugueseStemmer();

  if(!options || options == "") {

    config = {
      lowercase:    true,
      accent:       true,
      characters :  true,
      tokenizer:    true,
      stemmering :  true,
      connective:   true,
      stopwords:    true
    };

  } else {

    config.lowercase   = options.lowercase   || false;
    config.accent      = options.accent      || false;
    config.characters  = options.characters  || false;
    config.tokenizer   = options.tokenizer   || false;
    config.stemmering  = options.stemmering  || false;
    config.stopwords   = options.stopwords   || false;

  }

  if (config.lowercase) {
    query = query.toLowerCase();
  }

  if (config.stopwords) {
    query = stopwords.extract(query, {
      language: "portuguese",
      remove_digits: false,
      return_changed_case: true,
      remove_duplicates: false
    });
    query = query.toString();
    query = query.replace(/,/gi, " ");
  }

  if(config.accent){
    query = removeAceents(query);
  }

  if(config.characters){
    query = query.replace(/[^a-z A-Z 0-9]/g,'');
  }

  if (config.tokenizer) {
    query = tokenizer.tokenize(query);
  }

  if(config.stemmering) {
    if(!config.tokenizer){

      tokenizer = new natural.WordPunctTokenizer();
      query       = tokenizer.tokenize(query);

      for (var i = 0; i < query.length; i++) {
        query[i] = stemmer.stemWord(query[i]);
      }

      //(5) untokenizer
      query = query.toString();
      query = query.replace(/,/gi, " ");

    } else {
      // (4) stemmering
      for (var i = 0; i < query.length; i++) {
        query[i] = stemmer.stemWord(query[i]);
      }
    }
  }

  // (5) remover conectivos
  if(config.conectivos){

    if(!config.tokenizer) query = query.split(" ");

    query = removerConectivos(query);

    if(!config.tokenizer){
      query = query.toString();
      query = query.replace(/,/gi, " ");
    }

  }

  return query;

}

exports.classifier    = function (query) {

  var classifier  = new natural.BayesClassifier();

  // agradecimento
  classifier.addDocument(['muit','obrig'], 'agradecimento');
  classifier.addDocument(['muit','obrig'], 'agradecimento');
  classifier.addDocument(['fic','grat'], 'agradecimento');

  // encerramento
  classifier.addDocument(['ate','logo'], 'encerramento');
  classifier.addDocument(['tchau'], 'encerramento');
  classifier.addDocument(['xau'], 'encerramento');

  // questionamento
  classifier.addDocument(['?'], 'questionamento');
  classifier.addDocument(['gost'], 'questionamento');
  classifier.addDocument(['eu','prec'], 'questionamento');
  classifier.addDocument(['eu','gost','sab'], 'questionamento');
  classifier.addDocument(['eu','necess'], 'questionamento');
  classifier.addDocument(['eu','necess','sab'], 'questionamento');

  classifier.train();

  return classifier.classify(query);

};

exports.weightReply   = function(data) {

  var documents         = data.documents;
  var query             = data.query;
  var weight            = 0;
  var weightTitle       = 0;
  var weights           = [];
  var setence           = "";
  var tfidf             = null;
  var TfIdf             = natural.TfIdf;

  for (var i = 0; i < documents.length; i++) {

    tfidf = new TfIdf();

    // console.log(documents[i].tags.titulo);
    tfidf.addDocument(documents[i].tags.titulo);

    for (var y = 0; y < documents[i].tags.conteudo.length; y++) {
      // console.log(documents[i].tags.conteudo[y]);
      tfidf.addDocument(documents[i].tags.conteudo[y]);
    }

    tfidf.tfidfs(query, function(z, measure) {

      if (z == 0) { // title

        weightTitle = (measure * 2) / (documents[i].tags.titulo.length);

      } else { // content

        if(measure > 0) {
          weight = ( weightTitle + (measure / documents[i].tags.conteudo[z-1].length) );
        } else {
          weight = weightTitle / documents[i].tags.conteudo[z-1].length;
        }

        weights.push({
          indexDocument:  i,
          indexContent: z-1,
          weight: weight
        });

        weight = 0;

      }

    });

  }


  var document = weights[0];

  for (var i = 0; i < weights.length; i++) {
    if(weights[i].weight > document.weight){
      max = weights[i];
    }
  }

  return documents[document.indexDocument].conteudo[document.indexContent];

}

exports.processData   = function(data) {

  var tokenizer       = new natural.WordTokenizer();
  var stemmer         = new PortugueseStemmer();
  var titulo          = {};
  var conteudos       = [];
  var conteudo        = null;

  var stopwordsConfig = {
    language:             "portuguese",
    remove_digits:        false,
    return_changed_case:  true,
    remove_duplicates:    false
  };

  for (var i = 0; i < data.length; i++) {

    titulo  = stopwords.extract(data[i].titulo,   stopwordsConfig);
    titulo  = titulo.toString().replace(/,/gi, " ");
    titulo  = removeAceents(titulo);
    titulo  = titulo.replace(/[^a-z A-Z 0-9]/g,'');
    titulo  = tokenizer.tokenize(titulo);

    for (var y = 0; y < titulo.length; y++) {
      titulo[y] = stemmer.stemWord(titulo[y]);
    }

    for (var y = 0; y < data[i].conteudo.length; y++) {

      conteudo    = stopwords.extract(data[i].conteudo[y], stopwordsConfig);
      conteudo    = conteudo.toString().replace(/,/gi, " ");
      conteudo    = removeAceents(conteudo);
      conteudo    = conteudo.replace(/[^a-z A-Z 0-9]/g,'');
      conteudo    = tokenizer.tokenize(conteudo);

      for (var z = 0; z < conteudo.length; z++) {
        conteudo [z] = stemmer.stemWord(conteudo[z]);
      }

      conteudos.push(conteudo);

    }

    data[i].tags = {
      titulo: titulo,
      conteudo: conteudos
    };

    conteudos = [];

  }
  console.log(data);

  return data;

}

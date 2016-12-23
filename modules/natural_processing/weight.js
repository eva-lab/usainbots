var natural               = require('natural');

exports.weightDocuments   = function(data) {

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

    tfidf.addDocument(documents[i].tags.titulo);

    for (var y = 0; y < documents[i].tags.conteudo.length; y++) {
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

        weight = weight / 3;

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
  var index = 0;

  for (var i = 0; i < weights.length; i++) {
    if(weights[i].weight > document.weight){
      document = weights[i];
      index = i;
    }
  }

  return {
    word: documents[document.indexDocument].conteudo[document.indexContent],
    weight: weights[index].weight
  };

}

exports.weight = function(query, data) {

  var tfidf = null;
  var TfIdf = natural.TfIdf;
  var tokenizer = new natural.WordTokenizer();
  var weights = [];

  if (!query && !data) {
    return null;
  }

  if (typeof query != "object" && typeof query != "undefined") {
    query = tokenizer.tokenize(query);
  }

  tfidf = new TfIdf();

  for (var i = 0; i < data.length; i++) {
    tfidf.addDocument(data[i]);
  }

  tfidf.tfidfs(query, function(z, measure) {

    weights.push({
      indexDocument:  z,
      weight: measure
    });

  });

  var index = 0;
  var max = weights[index].weight;

  for (var i = 1; i < weights.length; i++) {
     if (weights[i].weight > max) {
       index = i;
     }
  }

  return {
    word: data[index],
    weight: weights[index]
  };

}

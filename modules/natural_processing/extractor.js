
var natural               = require('natural'),
    PortugueseStemmer     = require('snowball-stemmer.jsx/dest/portuguese-stemmer.common.min.js').PortugueseStemmer,
    stopwords             = require('keyword-extractor')
    exports               = module.exports;

exports.extract = function (data, options) {

  var config        =  {};
  var tokenizer     = new natural.WordTokenizer();
  var stemmer       = new PortugueseStemmer();

  if(typeof data != "object") {
    var toArray = [];
    toArray.push(data);
    data = toArray;
  }

  if(!options || options == "") {

    config = {
      lowercase:    true,
      accent:       true,
      characters :  true,
      tokenizer:    true,
      stemmering :  true,
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

  for (var i = 0; i < data.length; i++) {

    if (config.lowercase) {
      data[i] = data[i].toLowerCase();
    }

    if (config.stopwords) {

      data[i] = stopwords.extract(data[i], {
        language: "portuguese",
        remove_digits: false,
        return_changed_case: true,
        remove_duplicates: false
      });
      data[i] = data[i].toString();
      data[i] = data[i].replace(/,/gi, " ");
    }

    if(config.accent){
      data[i] = removeAceents(data[i]);
    }

    if(config.characters){
      data[i] = data[i].replace(/[^a-z A-Z 0-9]/g,'');
    }

    if (config.tokenizer) {

      if(!config.characters) {
        tokenizer = new natural.WordPunctTokenizer();
        data[i] = tokenizer.tokenize(data[i]);
      } else {
        data[i] = tokenizer.tokenize(data[i]);
      }

    }

    if(config.stemmering) {

      if(!config.tokenizer){

        tokenizer = new natural.WordPunctTokenizer();
        var tokens  = tokenizer.tokenize(data[i]);

        for (var y = 0; y < tokens.length; y++) {
          tokens[y] = stemmer.stemWord(tokens[y]);
        }

        tokens = tokens.toString();
        tokens = tokens.replace(/,/gi, " ");
        data[i] = tokens;

      } else {

        var stemm = data[i];

        for (var y = 0; y < stemm.length; y++) {
          stemm[y] = stemmer.stemWord(stemm[y]);
        }

        data[i] = stemm;

      }

    }

  }

  return data;

}

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

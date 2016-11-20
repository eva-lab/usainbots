
var natural               = require('natural'),
    moment                = require('moment'),
    PortugueseStemmer     = require('snowball-stemmer.jsx/dest/portuguese-stemmer.common.min.js').PortugueseStemmer,
    tags                  = require('../config/classifier'),
    TfIdf                 = natural.TfIdf,
    exports               = module.exports;

/* Funcoes Globais */

function removerAcentos(frase) {

	var mapaAcentosHex 	= {
		a : /[\xE0-\xE6]/g,
		e : /[\xE8-\xEB]/g,
		i : /[\xEC-\xEF]/g,
		o : /[\xF2-\xF6]/g,
		u : /[\xF9-\xFC]/g,
		c : /\xE7/g,
		n : /\xF1/g
	};

	for (var letra in mapaAcentosHex) {
		var expressaoRegular = mapaAcentosHex[letra];
		frase = frase.replace(expressaoRegular, letra);
	}

	return frase;

}

function removerConectivos(frase) {

  var conectores = [
    'o','a','os','as','um','uma','uns','umas','a','ao','aos','de','do','da','dos','das','dum','duma','duns','dumas','em',
    'no','na','nos','nas','num','numa','nuns','numas','por','pelo','pela','pelos','pelas','que', 'para', 'aquele', 'aqueles',
    'estes', 'estas', 'isto'
  ];

  for (var i = 0; i < conectores.length; i++) {
    for (var y = 0; y < frase.length; y++) {
      if(frase[y] == conectores[i]) {
        frase.splice(y,1);
      }
    }
  }

  return frase;

}

/* Exports */

exports.classificar     = function (query) {

  var classifier = {
    pergunta : false,
    agradecimento: false,
    encerramento: false
  }

  var regexp = new RegExp("\\?");

  if(regexp.test(query)){
    classifier.pergunta = true;
  }

  tags.encerramento   = tags.encerramento.toString();
  tags.encerramento   =  tags.encerramento.replace(/,/gi, "|");

  regexp = new RegExp(tags.encerramento);

  if(regexp.test(query)){
    classifier.encerramento = true;
  }

  tags.agradecimento  = tags.agradecimento.toString();
  tags.agradecimento  =  tags.agradecimento.replace(/,/gi, "|");

  regexp = new RegExp(tags.agradecimento);

  if(regexp.test(query)){
    classifier.agradecimento = true;
  }

  return classifier;

}

exports.processarDados  = function(dados) {

  var tokenizer     = new natural.WordTokenizer();
  var stemmer       = new PortugueseStemmer();
  var tags          = {};

  for (var i = 0; i < dados.length; i++) {

    // (1) remover acentuacao
    tags.titulo     = removerAcentos(dados[i].titulo.toLowerCase());
    tags.conteudo   = removerAcentos(dados[i].conteudo.toLowerCase());

    // (2) remover caracteres especiais de pontuacao e outros
    tags.titulo     = tags.titulo.replace(/[^a-z A-Z 0-9]/g,'');
    tags.conteudo   = tags.conteudo.replace(/[^a-z A-Z 0-9]/g,'');

    // (3) tokenizer
    tags.titulo     = tokenizer.tokenize(tags.titulo);
    tags.conteudo   = tokenizer.tokenize(tags.conteudo);

    // (4) stemmering
    for (var y = 0; y < tags.titulo.length; y++) {
      tags.titulo[y] = stemmer.stemWord(tags.titulo[y]);
    }

    for (var z = 0; z < tags.conteudo.length; z++) {
      tags.conteudo[z] = stemmer.stemWord(tags.conteudo[z]);
    }

    // (5) remover conectivos
    tags.titulo     = removerConectivos(tags.titulo);
    tags.conteudo   = removerConectivos(tags.conteudo);

    dados[i].tags = {
      titulo: tags.titulo,
      conteudo: tags.conteudo
    };

  }

  return dados;

}

exports.processarQuery  = function(query, opcoes) {

  if(!opcoes) opcoes = {};

  var tokenizer     = new natural.WordTokenizer();
  var stemmer       = new PortugueseStemmer();

  if(opcoes.all) {

    opcoes.acentos     = true;
    opcoes.caracteres  = true;
    opcoes.tokenizer   = true;
    opcoes.stemmering  = true;
    opcoes.conectivos  = true;

  } else {

    opcoes.acentos     = opcoes.acentos     || false;
    opcoes.caracteres  = opcoes.caracteres  || false;
    opcoes.tokenizer   = opcoes.tokenizer   || false;
    opcoes.stemmering  = opcoes.stemmering  || false;
    opcoes.conectivos  = opcoes.conectivos  || false;

  }

  // (0) lowercase
  query = query.toLowerCase();

  // (1) remover acentuacao
  if(opcoes.acentos){
    query       = removerAcentos(query);
  }

  // (2) remover caracteres especiais de pontuacao e outros
  if(opcoes.caracteres){
    query       = query.replace(/[^a-z A-Z 0-9]/g,'');
  }

  // (3) tokenizer
  if(opcoes.tokenizer){
    query       = tokenizer.tokenize(query);
  }

  if(opcoes.stemmering) {
    if(!opcoes.tokenizer){

      tokenizer = new natural.WordPunctTokenizer();

      // (3) tokenizer
      query       = tokenizer.tokenize(query);

      // (4) stemmering
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
  if(opcoes.conectivos){

    if(!opcoes.tokenizer) query = query.split(" ");

    query = removerConectivos(query);

    if(!opcoes.tokenizer){
      query = query.toString();
      query = query.replace(/,/gi, " ");
    }

  }

  return query;

}

exports.pesarDados      = function(dados) {

  var feeds         = dados.feeds;
  var query         = dados.query;
  var peso          = 0;
  var pesos         = [];
  var frase         = "";
  var tfidf         = null;

  for (var i = 0; i < feeds.length; i++) {

    tfidf = new TfIdf();

    frase = feeds[i].tags.titulo.toString();
    frase = frase.replace(/,/gi, " ");
    frase = frase.trim();
    tfidf.addDocument(frase);

    frase = feeds[i].tags.conteudo.toString();
    frase = frase.replace(/,/gi, " ");
    frase = frase.trim();
    tfidf.addDocument(frase);

    for (var y = 0; y < query.length; y++) {
      tfidf.tfidfs(query[y], function(z, measure) {
        peso = peso + measure;

      });
      if(query.length-1 == y){
        pesos.push(peso);
        peso = 0;
      }
    }

  }

  var maiorPeso = Math.max.apply(null, pesos);
  var indice    = 0;

  for (var i = 0; i < pesos.length; i++) {
    if(pesos[i] == maiorPeso){
      indice = i;
      break;
    }
  }

  return feeds[indice];

}

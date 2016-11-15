
var natural               = require('natural'),
    moment                = require('moment'),
    PortugueseStemmer     = require('snowball-stemmer.jsx/dest/portuguese-stemmer.common.min.js').PortugueseStemmer,
    exports               = module.exports;

exports.processar = function(dados) {

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

    for (var y = 0; y < tags.titulo.length; y++) {
      tags.titulo[y] = stemmer.stemWord(tags.titulo[y]);
    }

    for (var z = 0; z < tags.conteudo.length; z++) {
      tags.conteudo[z] = stemmer.stemWord(tags.conteudo[z]);
    }

    // (4) remover conectivos
    tags.titulo     = removerConectivos(tags.titulo);
    tags.conteudo   = removerConectivos(tags.conteudo);

    dados[i].tags = {
      titulo: tags.titulo,
      conteudo: tags.conteudo
    };

  }

  return dados;

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

}

exports.pesar = function(req, res, next) {

  // console.log(natural.JaroWinklerDistance("ones","onez"))
  // console.log(natural.JaroWinklerDistance('one', 'one'));
  // console.log(natural.LevenshteinDistance("ones","onez"));
  // console.log(natural.LevenshteinDistance('one', 'one'));
  // return;

  var stemmer = new PortugueseStemmer();

  if(req.body.query) {

    var frase = req.body.query;
    var textinho = [
    "centro",
    "informatica",
    "universidade",
    "federal",
    "pernambuco",
    "centro",
    "responsavel",
    "cursos",
    "graduacao",
    "ciencia",
    "computacao",
    "sistemas",
    "informacao",
    "e",
    "engenharia",
    "computacao",
    "alem",
    "cursos",
    "posgraduacao",
    "ciencia",
    "computacao"
  ];

  var peso = 0, distancia = 0;

    // (4) stemmer
    for (var i = 0; i < textinho.length; i++) {
      for (var y = 0; y < frase.length; y++) {
        distancia = natural.DiceCoefficient(textinho[i], frase[y]);
        console.log(textinho[i], frase[y], distancia);
        if(distancia > 0.4){
          console.log(textinho[i], frase[y], distancia);
          peso = peso + distancia;
        }
      }
    }

  }

  res.status(202).json({ mensagem: peso });

}

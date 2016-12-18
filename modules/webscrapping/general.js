var request   = require('request'),
    cheerio   = require('cheerio'),
    iconv     = require('iconv-lite'),
    exports   = module.exports;

exports.getContentSimplePost = function (data, done) {

  if(data.charset != 'utf8') {
    data.encoding = null;
  }

  request(data, function(err, res, body) {

    if(data.charset != 'utf8') {
      body = iconv.decode(body, data.charset);
    }
    var $ = cheerio.load(body, { ignoreWhitespace: false });

    var extractor  = { titulo: null, conteudo: [] };

    extractor.titulo = $(data.selector).find('h2').text().trim();

    $(data.selector + ' p').each(function(i, elem) {

      if($(this).text().trim() != ""){
        extractor.conteudo.push($(this).text().trim());
      }

    });

    if(extractor.conteudo.length < 1){
      $(data.selector + ' div').each(function(i, elem) {

        if($(this).text().trim() != ""){
          extractor.conteudo.push($(this).text().trim());
        }

      });
    }

    if(extractor.conteudo.length < 1){
      $(data.selector + ' spam').each(function(i, elem) {

        if($(this).text().trim() != ""){
          extractor.conteudo.push($(this).text().trim());
        }

      });
    }

    data.titulo   = extractor.titulo;
    data.conteudo = extractor.conteudo;

    done(false, [data]);

  });

}


//TODO
exports.getContentWiki = function(data, done){

  if(data.charset != 'utf8') {
    data.encoding = null;
  }

  request(data, function(err, res, body) {

    if(data.charset != 'utf8') {
      body = iconv.decode(body, data.charset);
    }

     var $ = cheerio.load(body);

     var p = [];

     var $extractor = $('#mw-content-text');
     var $h2        = $extractor.find('h2');
     var $h3        = $extractor.find('h3');
     var titulo     = "";
     var conteudo   = [];
     var extract    = [];

     $h2.each(function(i, elem) {

      titulo = $(this).children('.mw-headline').text().trim();
      conteudo = $(this).next('p').text().trim();

      if(titulo != "" && conteudo != "") {
        extract.push({
          idBot:  data.idBot,
          tipo:   data.tipo,
          uri:    data.uri,
          selector: data.selector || null,
          dataCriacao: data.dataCriacao,
          titulo: titulo,
          conteudo: [conteudo],
        });
      }

     });

     $h3.each(function(i, elem) {

      titulo   = $(this).children('.mw-headline').text().trim();
      conteudo = $(this).next('p').text().trim();

      if(titulo != "" && conteudo != "") {
        extract.push({
          idBot:  data.idBot,
          tipo:   data.tipo,
          uri:    data.uri,
          selector: data.selector || null,
          dataCriacao: data.dataCriacao,
          titulo: titulo,
          conteudo: [conteudo],
        });
      }

     });

     done(false, extract);

   });

};

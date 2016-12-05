var request   = require('request'),
    cheerio   = require('cheerio'),
    iconv     = require('iconv-lite'),
    moment    = require('moment'),
    exports   = module.exports;

exports.getNews = function(done){

  var config = {
    uri:      "http://www2.cin.ufpe.br/site/listaNoticias.php?s=1&c=21&t=1",
    encoding: null
  };

  request(config, function(err, res, body) {
    if(err) return;

    var bodyEncoded = iconv.decode(body, 'iso-8859-1');

    if(res.statusCode === 200) {

      var $ = cheerio.load(bodyEncoded);
      var noticias = [];

      $('ul[class=listaNoticia] a').each(function(i, elem) {

        if(i < 10) {
          noticias.push({
            titulo: $(this).children('h3').text().trim(),
            resumo: $(this).children('p').text().trim(),
            uri:    "http://www2.cin.ufpe.br/site/" + $(this).attr('href'),
          });
        }

      });

      done(false, noticias);

    } else {
      done(true);
    }

  });

};

exports.getEvents = function(done){

  var config = {
    uri:      "http://www2.cin.ufpe.br/site/listaEventosPrincipais.php?s=1&c=77",
    encoding: null
  };

  request(config, function(err, res, body) {

    if(err) return;

    var bodyEncoded = iconv.decode(body, 'iso-8859-1');

    if(res.statusCode === 200) {

      var $ = cheerio.load(bodyEncoded,{ ignoreWhitespace: true });
      var eventos = [];
      var data    = null;

      $('#eventos ul li a').each(function(i, elem) {

        data = $(this).children('h4').text().trim();
        data = parseInt(data);
        data = moment(data, "D MMM");

        if(i < 10) {
          eventos.push({
            titulo: $(this).children('span').children('h3').text().trim(),
            uri:    "http://www2.cin.ufpe.br/site/" + $(this).attr('href'),
            data:   data
          });
        }

      });

      done(false, eventos);

    } else {
      done(true);
    }

  });

};

const Documento = require('../../src/models/Documento'),
    request     = require('sync-request'),
    cheerio     = require('cheerio'),
    iconv       = require('iconv-lite'),
    moment      = require('moment'),
    cron        = require('node-cron');

module.exports.main = function() {

  console.log('# cronjob CIn atividado');

  cron.schedule('0 11 * * *', function() {

    console.log('Buscando Eventos e Notícias do CIn UFPE...');

    let noticias = getNews();
    let eventos = getEvents();

    let documentos = [];

    for(let i = 0; i < noticias.length; i++) {
      documentos.push(noticias[i]);
    }

    for(let i = 0; i < eventos.length; i++) {
      documentos.push(eventos[i]);
    }

    Documento.cadastrarDocumento(documentos, function (err, documentos) {
      if(err)  return;
      console.log('Eventos e Notícias do CIn UFPE salvos com sucesso');
    });

  });

}

function getNews() {

  let noticias = [];

  let res = request('GET', 'http://www2.cin.ufpe.br/site/listaNoticias.php?s=1&c=21&t=1');

  if(res.statusCode === 200) {

      let body = res.getBody();
      let bodyEncoded = iconv.decode(body, 'iso-8859-1');
      let $ = cheerio.load(bodyEncoded);

      $('ul[class=listaNoticia] a').each(function(i, elem) {

        if(i < 10) {
          noticias.push({
            tipo: "cinNews",
            titulo: $(this).children('h3').text().trim(),
            conteudo: $(this).children('p').text().trim(),
            uri:    "http://www2.cin.ufpe.br/site/" + $(this).attr('href'),
          });
        }

      });

  }

  return noticias;

};

function getEvents() {
  
  let res = request('GET', 'http://www2.cin.ufpe.br/site/listaEventosPrincipais.php?s=1&c=77');
  let eventos = [];

  if(res.statusCode === 200) {

    let body = res.getBody();
    let bodyEncoded = iconv.decode(body, 'iso-8859-1');
    let $ = cheerio.load(bodyEncoded,{ ignoreWhitespace: true });
    let data    = null;

    $('#eventos ul li a').each(function(i, elem) {

      data = $(this).children('h4').text().trim();
      data = parseInt(data);
      data = moment(data, "D MMM");

      if(i < 10) {
        eventos.push({
          tipo: "cinEvents",
          titulo: $(this).children('span').children('h3').text().trim(),
          uri:    "http://www2.cin.ufpe.br/site/" + $(this).attr('href'),
          data:   data
        });
      }

    });

  }

  return eventos;

};
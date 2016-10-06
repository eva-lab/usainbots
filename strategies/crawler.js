var request   = require('request'),
    cheerio   = require('cheerio'),
    url       = require('url-parse'),
    html2json = require('html2json').html2json,
    jvd       = require('jsvardump'),
    each      = require('each'),
    cheerio   = require('cheerio');

module.exports = function (){

  var pages = [
    { "titulo": "Wiki CIn", "url": "http://www.cin.ufpe.br/~pet/wiki/" },
    { "titulo": "Manual de Sobrevivência do CIn", "url": "http://www.cin.ufpe.br/~pet/wiki/index.php/Manual_de_Sobreviv%C3%AAncia_do_CIn" },
    { "titulo": "Coordenação de Infraestrutura", "url": "https://sites.google.com/a/cin.ufpe.br/coordenacao-de-infraestrutura/home?pli=1" },
    { "titulo": "Secretaria de Graduação", "url": "https://sites.google.com/site/secgradcin/home" },
    { "titulo": "FAQ de Sistemas de Informação", "url": "https://sites.google.com/a/cin.ufpe.br/faqsecgrad/" },
    { "titulo": "CIn - Graduação", "url": "http://www2.cin.ufpe.br/site/index.php" }
  ];

  request(pages[1].url, getPage);

  function getPage(err, res, body) {

    if (err) {
      console.log("Error: " + error); return;
    }

    if (res.statusCode === 200) {

      var $ = cheerio.load(body, { decodeEntities: false });

      $('html').find("script,noscript,style").remove();
      each([html2json($.html())]);

    }

  }

  function each(obj) {

    var mensagem = [];

    for (var k in obj){
        if (typeof obj[k] == "object" && obj[k] !== null) {

          if (obj[k].text) {

            // remove blank space
            obj[k].text = obj[k].text.trim();

            // line break
            obj[k].text = obj[k].text.replace(/\r?\n|\r|\t/g, "");

            // remove links
            if (obj[k].text.substring(0,4).toLowerCase() != 'http') {

              // get text with length > 20
              if(obj[k].text.length > 30) {
                mensagem.push(obj[k].text);
                console.log(obj[k].text);
              }

            }

          }

          each(obj[k]);
        }
    }

  }

}

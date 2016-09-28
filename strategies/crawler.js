var request   = require('request');
var cheerio   = require('cheerio');
var url       = require('url-parse');

module.exports = function (){

  var pages = [
    { "titulo": "Wiki CIn", "url": "http://www.cin.ufpe.br/~pet/wiki/" },
    { "titulo": "Manual de Sobrevivência do CIn", "url": "http://www.cin.ufpe.br/~pet/wiki/index.php/Manual_de_Sobreviv%C3%AAncia_do_CIn" },
    { "titulo": "Coordenação de Infraestrutura", "url": "https://sites.google.com/a/cin.ufpe.br/coordenacao-de-infraestrutura/home?pli=1" },
    { "titulo": "Secretaria de Graduação", "url": "https://sites.google.com/site/secgradcin/home" },
    { "titulo": "FAQ de Sistemas de Informação", "url": "https://sites.google.com/a/cin.ufpe.br/faqsecgrad/" },
    { "titulo": "CIn - Graduação", "url": "http://www2.cin.ufpe.br/site/index.php" }
  ];

  request(pages[0].url, getPage);

  function getPage(err, res, body) {

    if(err) {
      console.log("Error: " + error);
      return;
    }

    if(res.statusCode === 200) {

      var $ = cheerio.load(body);
      var cursos = null,
          grupos = null;

      $('div#mw-content-text').each(function(index) {

        cursos = $(this).find('ul').eq(2).text().split("\n");
        grupos = $(this).find('ul').eq(3).text().split("\n");

        for (var i = 0; i < cursos.length; i++) {
          cursos[i] = cursos[i].trim();
        }

        for (var i = 0; i < grupos.length; i++) {
          grupos[i] = grupos[i].trim();
        }

      });

      console.log(cursos, grupos);

    }

  }

}

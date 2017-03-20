const request   = require('sync-request'),
    cheerio   = require('cheerio'),
    iconv     = require('iconv-lite');

module.exports.wiki = function (data, done) {

  let res = request('GET', data.url);
  
  if(res.statusCode === 200) {

    let body = res.getBody();
    // let bodyEncoded = iconv.decode(body, data.charset);
    let $ = cheerio.load(body);

    let p = [];

    let $extractor = $('#mw-content-text');
    let $h2        = $extractor.find('h2');
    let $h3        = $extractor.find('h3');
    let titulo     = "";
    let conteudo   = [];
    let extract    = [];

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

  }

  done(false, extract);

};

// module.exports.googleSearch = function (query, done) {

//   let res = request('GET', "https://www.google.com.br/#q=" + query);
  
//   if(res.statusCode === 200) {

//     let body = res.getBody();
//     let $ = cheerio.load(body);

//     let $extractor = $('#search');
//     let $h2        = $extractor.find('h2');
//     let $h3        = $extractor.find('h3');

//     // console.log($h3.text());

//     $h3.each(function(i, elem) {

//       console.log($(this).text);

//     //   // titulo = $(this).children('.mw-headline').text().trim();
//     //   // conteudo = $(this).next('p').text().trim();

//     //   // if(titulo != "" && conteudo != "") {
//     //   //   extract.push({
//     //   //     idBot:  data.idBot,
//     //   //     tipo:   data.tipo,
//     //   //     uri:    data.uri,
//     //   //     selector: data.selector || null,
//     //   //     dataCriacao: data.dataCriacao,
//     //   //     titulo: titulo,
//     //   //     conteudo: [conteudo],
//     //   //   });
//     //   // }

//     });

//     // console.log($h3);



//   }

//   // done(false, extract);

// };
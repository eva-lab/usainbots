var request   = require('request'),
    cheerio   = require('cheerio'),
    iconv     = require('iconv-lite'),
    exports   = module.exports;

exports.getWiki = function(selector){

  if(selector.charset != 'utf8') {
    selector.encoding = null;
  }

  request(selector.uri, function(err, res, body) {

     if(err) return;

     if(selector.charset != 'utf8') {
         body = iconv.decode(body, selector.charset);
     }

     if(res.statusCode === 200) {
       var $ = cheerio.load(body);

       var p = [];

       var $content = $('#mw-content-text');
       var $h2      = $content.find('h2');
       var $h3      = $content.find('h3');
       var heading  = "";
       var content  = "";
       var data  = [];

       $h2.each(function(i, elem) {

        heading = $(this).children('.mw-headline').text().trim();
        content = $(this).next('p').text().trim();

        if(heading != "" && content != "") {
          data.push({
            title: heading,
            content: content,
          });
        }

       });

       $h3.each(function(i, elem) {

        heading = $(this).children('.mw-headline').text().trim();
        content = $(this).next('p').text().trim();

        if(heading != "" && content != "") {
          data.push({
            title: heading,
            content: content,
          });
        }

       });

       return data;

     }
  });

};

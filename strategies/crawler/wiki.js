var request   = require('request'),
    cheerio   = require('cheerio'),
    URL       = require('url-parse'),
    exports   = module.exports;

exports.getPage = function(){

  var pageToVisit = "http://www.cin.ufpe.br/~pet/wiki/index.php/P%C3%A1gina_principal";
  // console.log("Visiting page " + pageToVisit);

  request(pageToVisit, function(error, response, body) {
     if(error) {
       console.log("Error: " + error);
     }

    //  console.log("Status code: " + response.statusCode);
     if(response.statusCode === 200) {
       var $ = cheerio.load(body);

       var p = [];

      //  console.log( $('p').after('h2').text()  );

      // $('h2').addClass('titulo').html();

      // console.log($('h2').addClass('titulo').html());

       $('h2').children().each(function(i, elem) {

         if(($(this).attr('class') === 'mw-headline') == true) {
          //  console.log($(this).parent().text().trim());
          console.log($(this).parent().attr('class'));
         }
        //  if(){
         //
        //  }
        //  console.log($(this).before().children().first().text());
       });


        //=> apple, orange, pear


      //  console.log("Page title:  " + $('title').text());
     }
  });

};

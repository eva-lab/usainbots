var fs = require('file-system');

module.exports = function (dir, callback) {

  var path = require("path").join(__dirname, "../" + dir);
  var files = [];

  require("fs").readdirSync(path).forEach(function(file) {
    files.push("./" + dir + "/" + file);
  });

  callback(files);

};

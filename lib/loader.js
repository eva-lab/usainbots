var fs = require('file-system'),
    exports = module.exports;

exports.loadRequire = function (dir, callback) {

  var path = require("path").join(__dirname, "../" + dir);
  var files = [];

  require("fs").readdirSync(path).forEach(function(file) {
    files.push("./" + dir + "/" + file);
  });

  callback(files);

};

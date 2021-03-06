var exports   = module.exports,
    fs = require('file-system');

exports.load = function load(list) {

  var list__files = [];

  for (var i = 0; i < list.length; i++) {
    list__files.push(readFiles(list[i]));
  }

  return list__files[0];

}

function readFiles(dir) {

  var path = require("path").join(__dirname, "../" + dir);

  var files = [];

  require("fs").readdirSync(path).forEach(function(file) {
    files.push("./src/" + dir + "/" + file);
  });

  return files;

};

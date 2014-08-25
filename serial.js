var fs = require('fs');
var exec = require('child_process').exec;
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      var fileName = file;
      if (!file) return done(null, results);
      
      var file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            // results = results.concat(res);
            next();
          });
        } else {
          // console.log(file);
          var fileInfo = {};
          fileInfo.name = fileName;
          // var escaped = file.replace(/\s/g, "\\ ");
          // var escaped = escaped.replace(/\(/g, "\\(");
          // var escaped = escaped.replace(/\)/g, "\\)");
          // var escaped = escaped.replace(/\'/g, "\\'");
          // var escaped = escaped.replace(/\&/g, "\\&");
          exec('openssl sha1 "'+file+'"', { maxBuffer: (200*10240) }, function(p_err, p_stdout, p_stderr) {
            if(p_err) {
              fs.appendFile('errors.list', fileInfo.name+":"+fileInfo.hash+":"+p_err.message+"\r\n", function (err) {
                next();
              })
            } else if(p_stderr) {
              console.log(p_stderr);
            } else {
              var myregexp = /=\s?(\w*)/g;
              var match = myregexp.exec(p_stdout);
              fileInfo.hash = "Fake hash";
              if (match != null) {
                // console.log(match[1]);
                fileInfo.hash = match[1];
                // match = myregexp.exec(p_stdout);
                var searchValue = fileInfo.name+":"+fileInfo.hash;
                exec('grep "'+searchValue+'" ./files.list', { maxBuffer: (200*10240) }, function(p_err, p_stdout, p_stderr) {
                  if(!p_stdout){
                    fs.appendFile('files.list', searchValue+"\r\n", function (err) {
                      next();
                    })
                  }
                  else{
                    console.log("grep:*"+p_stdout+"*");
                    fs.appendFile('duplicates.list', file+"\r\n", function (err) {
                      next();
                    })
                    next();
                  }
                });
              }
              else{
                fs.appendFile('reallyfunkystuff.list', fileInfo.name+"\r\n", function (err) {
                  next();
                })
              }
            }
          });
        }
      });
    })();
  });
};
if(typeof process.argv[2] === "undefined") {
	logger.log("Usage: node dedup.js /Users/john { --dryrun }", 'info');
	process.exit(-1);
}
//argv[2] is set
else {
  // var tempFile = fs.openSync('files.list', 'r');
  // fs.closeSync(tempFile);
  // fs.unlinkSync('files.list');
  walk(process.argv[2], function(err, list){
    console.log("FINISHED");
  });
}

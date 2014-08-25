var fs = require('fs'),
    readline = require('readline');

var rd = readline.createInterface({
    input: fs.createReadStream('duplicates.list'),
    output: process.stdout,
    terminal: false
});

rd.on('line', function(line) {
    fs.unlinkSync(line);
});

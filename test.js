var exec = require('child_process').exec
var regexp = require('node-regexp')
var fs = require('fs');
var cmd = 'diskutil list'
exec(cmd, function(err, stdout, stderr) {
    if (err) {
      console.log('error running diskpart list command')
      console.log(err)
      return
    }
    var drives = [];
    var myregexp = /(\d):\s*(\w*)\s*([a-zA-Z_]*\s?[a-zA-Z_]*)\s*\*?(\d?\d?\d\.\d)\s(\w\w)\s*(\w*)/g;
    var match = myregexp.exec(stdout);
    while (match != null) {
      var drive = {}
      drive.ordinal = match[1];
      drive.type = match[2];
      drive.name = match[3];
      drive.size = {};
      drive.size.value = match[4];
      drive.size.measurement = match[5];
      drive.location = match[6];
      drive.files = [];
      drive.directories = [];
      drives.push(drive);
      match = myregexp.exec(stdout);
    }
    loopDrives(drives); 
});
var driveIterator = 0;
var loopDrives = function(arr) {
  var drive = arr[driveIterator];
  if(drive != null){
    var hasName = drive.name != null;
    var hasName2 = drive.name !== "";
    if(hasName && hasName2){
      var path = '/Volumes/'+drive.name;
      if (fs.existsSync(path)) {
        listFiles(path, function(err){
            driveIterator++;
            if(driveIterator < arr.length) {
              loopDrives(arr);
            }
            else{
              console.log("Finished");
            }
        });
      }
      else{
         driveIterator++;
         loopDrives(arr);
      }
    }
    else{
      driveIterator++;
      loopDrives(arr);
    }
  }
}
// var fileItterator = 0;
var loopFiles = function(arr, path, fileItterator, callback) {
  var file = arr[fileItterator];
  if(file != null){
      console.log(file);
      fileItterator++;
      var fullName = path+"/"+file;
      if(isDirectory(fullName)){
         fullName = getDirectoryName(fullName);
         var files = fs.readdirSync(fullName);
         console.log(JSON.stringify(files));
         loopFiles(files, fullName, 0, function(){
           loopFiles(arr, path, fileItterator, callback);
         }); 
      }
      else{
        loopFiles(arr, path, fileItterator, callback);
      }
  }
  else{
    callback();
  }
}

// var listFiles = function(path, callback) {
//   console.log(path);
//  callback();
// }
var listFiles= function(path, callback){
  var files = [];
  if(isDirectory(path)){
    path = getDirectoryName(path);
    var files = fs.readdirSync(path);
    loopFiles(files,path,0,callback);
  }
}
var listFiles2= function(path, callback){
  var files = [];
  if(isDirectory(path)){
    path = getDirectoryName(path);
    var files = fs.readdirSync(path);
    var filei = 0;
    for(0; filei < files.length; filei++){
      var file = files[filei];
      console.log(file);
      // if(isDirectory(path+"/"+file)){
        // files.concat(listFiles(path+"/"+file));
        var myregexp = /\.\w*/g;
        var match = myregexp.exec(file);
        if(fs.lstatSync(path).isSymbolicLink()){
          console.log("Skipping symbolic link");
        }
        else if(match == null){
          listFiles(path+"/"+file)
        }
      // }
      // else if(fs.lstatSync(path).isSymbolicLink()){
      //  console.log("Skipping symbolic link");
     // } 
     // else{
        // files.push(path+"/"+file);
     //   writeToFile(path+"/"+file);
     // }
    }
  }
  else{
    // files.push(path);
    console.log(path);
  }
  callback();
}
var stream = fs.createWriteStream("./files.list");
function writeToFile(text){
  console.log("Adding file "+text);
  // fs.writeFile("./files.list", text, function(err){
  //  if(err){
  //    console.log("Danger "+ err);

  //  }
  // }); 
}
function isDirectory(path){
  var stat = fs.lstatSync(path);
  if(stat.isDirectory()){
    return true;
  }
  if (fs.lstatSync(path).isSymbolicLink()) {
    var link = fs.readlinkSync(path);
    if (fs.lstatSync(link).isDirectory()) {
      return true;
    }
  }
  return false;
}
function getDirectoryName(path){
  var stat = fs.lstatSync(path);
  if(stat.isDirectory()){
    return path;
  }
  if (fs.lstatSync(path).isSymbolicLink()) {
    var link = fs.readlinkSync(path);
    if (fs.lstatSync(link).isDirectory()) {
      return link;
    }
  }
}

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
    //FIXME make me asynchronous
    // each(i = 0; i < drives.length; i++) {
    loopDrives(drives); 
    //  var drive = drives[i];
    //  var files = []; 
    //  if(drive.name != null && drive.name !== ''){
    //    var path = '/Volumes/'+drive.name;
    //    if (fs.existsSync(path)) {
    //        if(fs.lstatSync(path).isSymbolicLink()){
    //          path = fs.readlinkSync(path);
    //        }
            // drive.files.concat(listFiles(path));
    //        console.log("Listing files in "+path);
    //        listFiles(path);
    //    }
    //    console.log(drive.name + ':'+JSON.stringify(drive));
    //  }
    //}
});
var x = 0;
var loopDrives = function(arr) {
  var drive = arr[x];
  if(drive != null){
    var hasName = drive.name != null;
    var hasName2 = drive.name !== "";
    if(hasName && hasName2){
      var path = '/Volumes/'+drive.name;
      if (fs.existsSync(path)) {
        listFiles(path, function(err){
            x++;
            if(x < arr.length) {
              loopDrives(arr);
            }
            else{
              console.log("Finished");
            }
        });
      }
      else{
         x++;
         loopDrives(arr);
      }
    }
    else{
      x++;
      loopDrives(arr);
    }
  }
}
var loopDrives2 = function(arr) {
    console.log(JSON.stringify(arr[0]));
    var drive = arr[x];
    console.log("Inside *"+drive.name);
    if(drive.name != null && drive.name !== ''){
        console.log("In here");
        var path = '/Volumes/'+drive.name;
        if (fs.existsSync(path)) {
          console.out("Test "+path);
          if(fs.lstatSync(path).isSymbolicLink()){
              console.log("Reading");
              path = fs.readlinkSync(path);
          }
          console.log("Listing files");
          listFiles(path, function(err){
            console.log("Made it back");
            x++;
            if(x < arr.length) {
              loopDrives(arr);   
            }
            else{
              console.log("Finished");
            }
          });
        }
     }
     else{
       
       x++;
       loopDrives(arr);
     }
}
        // console.log(drive.name + ':'+JSON.stringify(drive));
        // listFiles(,function(){

// var listFiles = function(path, callback) {
//   console.log(path);
//  callback();
// }
var listFiles= function(path, callback){
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

const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mimie');
const cache = {};

/*  handle the sending of 404 erros
 when a file is request that doesn't
 exist */
let send404 = (res) => {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.write(`Error 404: resource not found`);
  res.end();
}

/* writes the appropriate HTTP headers 
and then sends the contents of the file */
let sendFile = (res, filePath, fileContents) => {
  res.writeHead(
    200,
    {"content-type": mime.lookup(path.basename(filePath))}
  );
  res.end(fileContents);
}

let serverStatic = (res, cache, absPath) => {
  if(cache[absPath]) {
    sendFile(res, absPath, cache[absPath]);
  } else {
    fs.exists(absPath, (exists) => {
      if(exists) {
        fs.readFile(absPath, (err, data) => {
          if(err) {
            send404(res);
          } else {
            cache[absPath] = data;
            sendFile(res, absPath, data);
          }
        });
      } else {
        send404(res);
      }
    });
  }
}
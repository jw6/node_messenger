const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const cache = {};
const chatServer = require('./lib/chat_server');

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
    {"content-type": mime.getType(path.basename(filePath))}
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

let server = http.createServer((req, res) => {
  let filePath = false;

  if(req.url === '/') {
    filePath = 'public/index.html';
  } else {
    filePath = 'public' + req.url;
  }

  let absPath = './' + filePath;
  serverStatic(res, cache, absPath);
});

server.listen(3000, () => {
  console.log(`Server listening on port 3000`);
})
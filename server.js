// модуль отвечающий за создание и подключение сервера
const http = require("http");
const url = require("url");

function start(route, handle) {
    function onRequest(request, response) {  
      var postData = "";
      let pathname = url.parse(request.url).pathname;//может попробовать const
      console.log("Request for " + pathname + " received.");

      request.setEncoding("utf8");

      request.addListener("data", function(postDataChunk) {
        postData += postDataChunk;
        console.log("Received POST data chunk '"+
        postDataChunk + "'.");
      });

      request.addListener("end", function() {
        route(handle, pathname, response, postData);
      });
    }
  
    http.createServer(onRequest).listen(3000);
    console.log("Server has started.");
  }

exports.start = start;

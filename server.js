// модуль отвечающий за создание и подключение сервера
const http = require("http");
const url = require("url");

function start(route, handle) {
    function onRequest(request, response) {
      let pathname = url.parse(request.url).pathname;
      console.log("Request for " + pathname + " received.");
  
      var content = route(handle, pathname, response);
  
    //   response.writeHead(200, {"Content-Type": "text/plain"});
    //   response.write("Hello World");
    //   response.write(content);//
    //   response.end();
    }
  
    http.createServer(onRequest).listen(3000);
    console.log("Server has started.");
  }

exports.start = start;

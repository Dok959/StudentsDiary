var querystring = require("querystring");
var exec = require("child_process").exec;
const fs = require('fs')
const path = require('path')

function start(response) {
    let filePath = path.join('html', 'index.html')
    console.log(filePath)
    let contentType = 'text/html'
    fs.readFile(filePath, (err, content) => {
        if (!err) {
            // res.writeHead(200, {
            //     'Content-Type': contentType
            // })
            response.statusCode = 200;
            response.setHeader('Content-Type', contentType);
            response.end(content)
        }
    })
    // console.log("Request handler 'start' was called.");

    // //exec - неблокирующий вызов
    // exec("find /",
    //   { timeout: 10000, maxBuffer: 20000*1024 },
    //   function (error, stdout, stderr) {
    //   response.writeHead(200, {"Content-Type": "text/plain"});
    //   response.write(stdout);
    //   response.end();
    // });

}

function upload(response) {
    console.log("Request handler 'upload' was called.");
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write("You've sent: " +
        querystring.parse('бла-бла-бла').text);
    response.end();
}

exports.start = start;
exports.upload = upload;
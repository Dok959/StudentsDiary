// Точка входа приложения

//считывание конфига
require('dotenv').config();

//подключение модулей
const express = require('express'); // подключение express
const fs = require('fs'); // подключение работы с файлами

// создаем объект приложения
const app = express();

// определение порта
const PORT = process.env.PORT;

// определяем обработчик для для ведения лога вызовов сервера
app.use(function(request, response, next){
     
    let now = new Date();
    let hour = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let data = `${hour}:${minutes}:${seconds} ${request.method} ${request.url} ${request.get('user-agent')}`;
    fs.appendFile('server.log', data + '\n', function(){});
    next();
});

// определяем обработчик для маршрута '/'
app.get('/', function(request, response){  // требуется указывать все пути, иначе будет ошибка
     
    // отправляем ответ
    response.send('<h2>Привет Express!</h2>');
});

// начинаем прослушивать подключения на 3000 порту
app.listen(PORT, () => {
    console.log(`Server has been started and listening at http://localhost:${PORT}`);
});
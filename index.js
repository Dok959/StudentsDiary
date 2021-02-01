// Точка входа приложения

//считывание конфига
require('dotenv').config();

//подключение модулей
const express = require('express'); // подключение express
const router = require('./router'); // подключение маршрутизатора
const hbs = require("hbs");

// создаем объект приложения
const app = express();

// определение порта
const PORT = process.env.PORT;

// создаем установку и подключение представлений
app.set('view engine', 'hbs'); // установка движка представлений
app.set('views', 'html'); // установка пути к представлениям
hbs.registerPartials(__dirname + '/html/parts'); // установка пути к частичным представлениям

// перевод на маршрутизацию файлов
app.use(router);

// начинаем прослушивать подключение на 3000 порту
app.listen(PORT, () => {
    console.log(`Server has been started and listening at http://localhost:${PORT}`);
});
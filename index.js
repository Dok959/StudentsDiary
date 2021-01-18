// Точка входа приложения

//считывание конфига
require('dotenv').config();

//подключение модулей
const express = require('express'); // подключение express
const router = require('./router'); // подключение маршрутизатора

// создаем объект приложения
const app = express();

// определение порта
const PORT = process.env.PORT;

// перевод на маршрутизацию файлов
app.use(router);

// начинаем прослушивать подключение на 3000 порту
app.listen(PORT, () => {
    console.log(`Server has been started and listening at http://localhost:${PORT}`);
});
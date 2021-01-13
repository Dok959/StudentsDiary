function validation(stingParse, code){
    let flag = true
    stingParse.forEach(element => {
        flag = /(\s+)|((?!\W|@#))|[\/;.,2'"]/.test(element)
        if (flag === true){ // если есть недопустимый символ
            break
        }

        const len = element.length
        if (len < 5){
            flag = false // может убрать?
            break // сообщить об ошибке ввода
        }
    })
    if (flag === true){
        return 'ok'
    }
}

exports.validation = validation()
// module.exports = validation()
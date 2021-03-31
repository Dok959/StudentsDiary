// установка куки
function setCookie(name, value, options = {}) {
    options = {
        path: '/',
    };

    let updatedCookie =
        encodeURIComponent(name) + '=' + encodeURIComponent(value);

    for (let optionKey in options) {
        updatedCookie += '; ' + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += '=' + optionValue;
        }
    }

    document.cookie = updatedCookie;
}

// получение куки
function getCookie(request, name) {
    let matches = request.match(
        new RegExp(
            '(?:^|; )' +
                name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') +
                '=([^;]*)'
        )
    );
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

// удаление куки
function deleteCookie(name) {
    setCookie(name, '', {
        'max-age': -1,
    });
}

try {
    module.exports = { setCookie, getCookie, deleteCookie };
} catch (error) {}

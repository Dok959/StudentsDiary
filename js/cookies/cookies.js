// установка куки
function setCookie(name, value, options = {}) {
    options = {
        path: '/',
    };

    let updatedCookie =
        `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    for (const optionKey in options) {
        if (Object.prototype.hasOwnProperty.call(options, optionKey)) {
            updatedCookie += `; ${optionKey}`;
            const optionValue = options[optionKey];
            if (optionValue !== true) {
                updatedCookie += `=${optionValue}`;
            }
        }
    }

    document.cookie = updatedCookie;
}

// получение куки
function getCookie(request, name) {
    const matches = request.match(
        new RegExp(
            `(?:^|; )${name.replace(/([.$?*|{}()[]\\\/\+^])/g, '\\$1')}=([^;]*)`
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
} catch (error) {
    /* empty */
}

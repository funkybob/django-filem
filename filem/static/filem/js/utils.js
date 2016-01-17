function get_cookie(name) {
    if(!document.cookie || document.cookie === '') return;
    var bits = document.cookie.split(';');
    for(var i=0, l=bits.length; i < l; i++) {
        var m = bits[i].trim().match(/(\w+)=(.*)/);
        if(m !== undefined && m[1] == name) {
            return decodeURIComponent(m[2])
        }
    }
}

/* resolve a string to an element, if it's not already */
function element(el) {
    return (typeof el == 'string') ? document.querySelector(el) : el;
}

/* Helpers for Fetch */
function check_status(response) {
    if(response.status >= 200 && response.status < 300) { return response; }
    var err = new Error(response.statusText);
    err.response = response;
    throw err;
}
function json (response) { return response.json(); }

fetch.post = function (url, data) {
    return fetch(url, {
        method: 'post',
        body: data,
        credentials: 'same-origin',
        headers: { 'X-CSRFToken': get_cookie('csrftoken') }
    });
}

fetch.get = function (url, data) {
    return fetch(url, {
        body: data,
        credentials: 'same-origin',
    })
}

/* string helper */
String.prototype.format = function (args) {
    return this.replace(/{([\-\w]+)}/g, function(m, key) { return args[key]; });
}

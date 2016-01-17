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

/* Helpers for Fetch */
function check_status(response) {
    if(response.status >= 200 && response.status < 300) { return response; }
    var err = new Error(response.statusText);
    err.response = response;
    throw err;
}
function json (response) { return response.json(); }

function post(url, data) {
    return fetch(url, {
        method: 'post',
        body: data,
        credentials: 'same-origin',
        headers: { 'X-CSRFToken': get_cookie('csrftoken') }
    });
}

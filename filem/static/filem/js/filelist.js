function FileList(el) {
    this.el = element(el);

    this.el.addEventListener('click', function (ev) {
        if(!el.target.matches('li')) return false;
        var elements = Array.from(ev.target.querySelectorAll('li'));
        elements.forEach(function (el) { el.classList.remove('selected'); });
        ev.target.classList.add('selected');
    }.bind(this));

    this.el.addEventListener('dblclick', function (ev) {
        if(!el.target.matches('li')) return false;
        this.ondblclick(ev);
    }.bind(this));

    return this;
}

FileList.prototype = {
    load: function (path) {
        fetch.get('files/' + path)
            .then(check_status)
            .then(json)
            .then(this.render.bind(this))
            .catch(function (error) {
                this.render({path: path, files: []});
            }.bind(this));
    },
    render: function (data) {
        var c = `<ul data-path="${data.path}">`;
        data.files.forEach(function (node) {
            c += `<li data-name="${node.name}" data-type="{$node['content-type']"><img src="${node.thumb}"><p>${node.name}</p></li>`;
        });
        c += '</ul>';
        this.el.innerHTML = c;
    },
    ondblclick: function (ev) {
        var path = ev.currentTarget.firstChild.dataset.path + '/' + ev.target.parentElement.dataset.name,
            ctype = ev.target.parentElement.dataset.type;

        if(ctype == 'inode/directory') {
            this.el.dispatchEvent(new CustomEvent('setpath', {detail: path}));
        }
        else if(ctype.startsWith('image/')) {
            lb.show('<div class="lb-image"><img src="/media/' + path + '"></div>');
        }
        else if(ctype.startsWith('text/')) {
            lb.show_spinner();
            fetch.get('/media/' + path)
                .then(check_status)
                .then(function (resp) { return resp.text(); })
                .then(function (text) {
                    lb.set_content('<pre>' + text + '</pre>');
                });
        }
    }
};

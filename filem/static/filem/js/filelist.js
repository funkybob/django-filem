function FileList(el) {
    this.el = element(el);

    $('#files').on('dblclick', "li", this.ondblclick.bind(this));

    return this;
}

FileList.prototype = {
    load: function (path) {
        fetch('files/' + path, {credentials: 'same-origin'})
            .then(check_status)
            .then(json)
            .then(this.render.bind(this))
            .catch(function (error) {
                this.render({path: path, files: []});
            }.bind(this));
    },
    render: function (data) {
        var c = '<ul data-path="' + data.path + '">';
        data.files.forEach(function (node) {
            c += '<li data-name="' + node.name + '" data-type="' + node['content-type'] + '">' +
                    '<img src="' + node.thumb + '">' +
                    '<p>' + node.name + '</p>' +
                '</li>';
        });
        c += '</ul>';
        this.el.innerHTML = c;
    },
    ondblclick: function (ev) {
        var target = ev.currentTarget,
            path = target.parentElement.dataset.path + '/' + target.dataset.name,
            ctype = target.dataset.type;
        if(ctype == 'inode/directory') {
            this.el.dispatchEvent(new CustomEvent('setpath', {detail: path}));
        }
        else if(ctype.startsWith('image/')) {
            lb.show('<div class="lb-image"><img src="/media/' + path + '"></div>');
        }
        else if(ctype.startsWith('text/')) {
            lb.show_spinner();
            fetch('/media/' + path)
                .then(check_status)
                .then(function (resp) { return resp.text(); })
                .then(function (text) {
                    lb.set_content('<pre>' + text + '</pre>');
                });
        }

    }
}

$('#files').on('dblclick', "li", function (ev) {
});

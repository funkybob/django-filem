function DirList(el) {
    if(typeof el == 'string') {
        this.el = document.querySelector(el);
    } else {
        this.el = el;
    }
    this.open_nodes = {'': true};

    $(this.el).on({
        'click': function (ev) {
            this.path = ev.currentTarget.dataset.path;
        }.bind(this),
        'dblclick': function (ev) {
            var path = ev.currentTarget.dataset.path;
            if(path !== '' && (path in this.open_nodes)) {
                delete this.open_nodes[path];
            } else {
                this.open_nodes[path] = true;
            }
            this.preen();
        }.bind(this),
    }, 'li');

    return this;
}

DirList.prototype = {
    load: function (path) {
        path = path || this._path;
        fetch('tree/', {credentials: 'same-origin'})
            .then(check_status)
            .then(json)
            .then(this.render.bind(this));
    },
    render: function (data) {
        this.el.innerHTML = '<ul>' + this.render_nodes([
            {path: '', name: '/', children: data.tree}
        ]) + '</ul>';
        this.preen();
    },
    render_nodes: function(nodelist) {
        var c = '';
        nodelist.forEach(function (node) {
            var is_open = node.path.startsWith(this._path);
            c += '<li data-path="' + node.path + '">' +
                    '<span>' + node.name + '</span>';
            if(node.children.length > 0) {
                c += '<ul>';
                c += this.render_nodes(node.children);
                c += '</ul>';
            }
            c += '</li>';
        }.bind(this));
        return c;
    },
    preen: function () {
        var nodes = document.querySelectorAll('nav li');
        for(var i=0, l=nodes.length; i < l ; i++) {
            var el = nodes.item(i),
                path = el.dataset.path;
            el.classList[this._path.startsWith(path) ? 'add' : 'remove']('current');
            el.classList[(path in this.open_nodes) ? 'add' : 'remove']('open');
        }
    },
    get path() { return this._path; },
    set path(path) {
        if(path == this._path) { return; }
        history.pushState({}, '', '#' + path);
        this._path = path;
        this.load(path);
        this.el.dispatchEvent(new Event('path'));
    },
    set_initial_path: function(path) {
        // pre-seed the open nodes
        var parts = path.split('/');
        var path = '';
        for(var i=0, l=parts.length; i < l ; i++) {
            if(path === '' ) { path = parts[i]; }
            else { path = path + '/' + parts[i]; }
            this.open_nodes[path] = true;
        }
        this.path = path;        
    }
}

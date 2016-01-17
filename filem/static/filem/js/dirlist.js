function DirList(el) {
    this.el = element(el);

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
        path = path || this._path || '/';
        fetch.get('tree')
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
            c += '<li data-path="{path}"><span>{name}</span>'.format(node);
            if(node.children.length > 0) {
                c += '<ul>' + this.render_nodes(node.children) + '</ul>';
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
            el.classList[(path === this._path) ? 'add' : 'remove']('selected');
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

function DirMenuActions() {
    return this;
}
DirMenuActions.prototype = {
    create: function(target, ev) {
        lb.show_form({
            fields: [
                {label: 'Name', name: 'name', type: 'text'}
            ],
            buttons: [
                {label: 'Create', name: 'create'}
            ]
        })
        function handleCreateDir(ev) {
            var data = new FormData(lb.el.querySelector('form'));
            data.append('target', target);
            data.append('action', 'create');
            fetch.post('dir/', data)
                .then(function () {
            lb.hide();
                    dirlist.load();
                        filelist.load(dirlist.path);
                });
        }
        var button = lb.el.querySelector('button');
        button.addEventListener('click', handleCreateDir);
        lb.el.addEventListener('hide', function () {
            button.removeEventListener('click', handleCreateDir);
        });
    }
};

class DirList {
  constructor(el) {
    this.el = element(el);

    this.open_nodes = {'': true};

    this.el.addEventListener('click', (ev) => {
        var tgt = ev.target.closest('li');
        if(!this.el.contains(tgt)) return false;
        this.path = tgt.dataset.path;
    });

    this.el.addEventListener('dblclick', (ev) => {
        var tgt = ev.target.closest('li');
        if(!this.el.contains(tgt)) return false;
        var path = tgt.dataset.path;
        if(path !== '' && (path in this.open_nodes)) {
            delete this.open_nodes[path];
        } else {
            this.open_nodes[path] = true;
        }
        this.preen();
    });
  }

  load(path) {
    path = path || this._path || '/';
    fetch.get('tree')
      .then(check_status)
      .then(json)
      .then(this.render.bind(this));
  }

  render(data) {
    this.el.innerHTML = '<ul>' + this.render_nodes([
      {path: '', name: '/', children: data.tree}
    ]) + '</ul>';
    this.preen();
  }

  render_nodes(nodelist) {
    var c = '';
    nodelist.forEach((node) => {
      var is_open = node.path.startsWith(this._path);
      c += `<li data-path="${node.path}"><span>${node.name}</span>`;
      if(node.children.length > 0) {
        c += '<ul>' + this.render_nodes(node.children) + '</ul>';
      }
      c += '</li>';
    });
    return c;
  }

  preen() {
    var nodes = document.querySelectorAll('nav li');
    for(var i=0, l=nodes.length; i < l ; i++) {
      var el = nodes.item(i),
          path = el.dataset.path;
      el.classList[this._path.startsWith(path) ? 'add' : 'remove']('current');
      el.classList[(path in this.open_nodes) ? 'add' : 'remove']('open');
      el.classList[(path === this._path) ? 'add' : 'remove']('selected');
    }
  }

  get path() { return this._path; }
  set path(path) {
    if(path == this._path) { return; }
    history.pushState({}, '', '#' + path);
    this._path = path;
    this.load(path);
    this.el.dispatchEvent(new Event('path'));
  }

  set_initial_path(path) {
    // pre-seed the open nodes
    var parts = path.split('/');
    path = '';
    for(var i=0, l=parts.length; i < l ; i++) {
      if(path === '' ) { path = parts[i]; }
      else { path = path + '/' + parts[i]; }
      this.open_nodes[path] = true;
    }
    this.path = path;
  }
};

class DirMenuActions {
  constructor() {}

  create(target, ev) {
    lb.show_form({
      fields: [
        {label: 'Name', name: 'name', type: 'text'}
      ],
      buttons: [
        {label: 'Create', name: 'create'}
      ]
    });
    // XXX listen to lb "button" events
    lb.el.addEventListener('button', (ev) => this.do_create(ev));
    lb.el.addEventListener('hide', () => button.removeEventListener('click', this.do_create));
  }

  do_create(ev) {
    switch(ev.detail) {
      case 'cancel':
      case 'close':
        break;
      case 'create':
        var data = new FormData(lb.el.querySelector('form'));
        data.append('target', target);
        data.append('action', 'create');
        fetch.post('dir/', data)
          .then(() => {
            lb.hide();
            dirlist.load();
            filelist.load(dirlist.path);
          });
    }
    ls.hide();
  }

  del(target, ev) {
    lb.show_form({
      fields: [
        {'label': 'Are you sure?', type: 'label'}
      ],
      buttons: [
        {name: 'cancel', label: 'Cancel', action: 'cancel'},
        {name: 'confirm', label: 'Confirm', action: 'confirm'}
      ]
    });
  }

};

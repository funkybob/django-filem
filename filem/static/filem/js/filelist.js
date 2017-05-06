class FileList {
  constructor(el) {
    this.el = element(el);

    this.el.addEventListener('click', (ev) => {
        if(!this.el.contains(ev.target.closest('li'))) return;
        Array.from(ev.target.querySelectorAll('li'), (el) => el.classList.remove('selected'));
        ev.target.classList.add('selected');
    });

    this.el.addEventListener('dblclick', (ev) => {
        if(!this.el.contains(ev.target.closest('li'))) return;
        this.ondblclick(ev, ev.target.closest('li'));
    });
  }

  load(path) {
    fetch.get('files/' + path)
      .then(check_status)
      .then(json)
      .then(this.render.bind(this))
      .catch((error) => {
        this.render({path: path, files: []});
      });
  }

  render(data) {
    var c = `<ul data-path="${data.path}">`;
    data.files.forEach((node) => {
      c += `<li data-name="${node.name}" data-type="${node['content-type']}"><img src="${node.thumb}"><p>${node.name}</p></li>`;
    });
    c += '</ul>';
    this.el.innerHTML = c;
  }

  ondblclick(ev) {
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
        .then((resp) => resp.text())
        .then((text) => {
          lb.set_content('<pre>' + text + '</pre>');
        });
    }
  }

}

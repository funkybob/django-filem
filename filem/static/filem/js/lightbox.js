
class Lightbox {
  constructor(el) {
    this.el = element(el);

    this.el.parentElement.addEventListener('click', (ev) => {
        if(ev.target == this.el.parentNode) { this.hide(); }
    });
  }

  show(content) {
    var e = new Event('show');
    if(this.el.dispatchEvent(e)) {
      if(content !== undefined) {
        this.set_content(content);
      }
      this.el.parentNode.style.display = 'flex';
    }
  }

  show_spinner() {
    this.show('<span class="spinner"></span>');
  }

  show_form(opts) {
    var templates = {
      '': (field) => `<div><label>${field.label}</label><input type="${field.type}" name="${field.name}"></div>`,
      'label': (field) => `<div><label>${field.label}</label></div>`,
      'textarea': (field) => `<div><label>${field.label}</label><textarea name="${field.name}"></textarea>`
    }
    // build field list
    var fields = opts.fields.map((field) => {
      // XXX Handle textarea, select...
      tmpl = field['template'] || templates[field.type] || templates[''];
      return tmpl(field);
    }).join('\n');
    // build button list
    var buttons = opts.buttons.map((button) => {
        return `<li><button type="button" name="${button.name}" data-action="${button.action}">${button.label}</li>`;
    }).join('\n');
    // build content
    this.show(`<form> <fieldset>${fields}</fieldset> <ul class="form-buttons">{buttons}</ul> </form>`);
    this.el.querySelector('input, textarea, select').focus();
    this.el.addEventListener('click', (ev) => {
      var tgt = ev.target.closest('button');
      if(!this.el.contains(tgt)) return false;
      this.el.dispatchEvent(new CustomEvent('button', {detail: ev.currentTarget.datamap.action}));
    })
  }

  hide() {
    var e = new Event('hide');
    if(this.el.dispatchEvent(e)) {
      this.el.parentNode.style.display = 'none';
    }
  }

  set_content(content) {
    this.el.innerHTML = content;
  }

}

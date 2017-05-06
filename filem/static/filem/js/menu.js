/*
 * Menu(menu element, context element, handlers map)
 *
 */

class Menu {
  constructor(el, target, handlers) {
    this.el = element(el);
    this.target = element(target);

    this.target.addEventListener('contextmenu', (ev) => {
      var tgt = ev.target.closest('span');
      if(!this.target.contains(tgt)) return false;
      ev.preventDefault();
      this.el.dataset.target = tgt.parentNode.dataset.path;
      this.show(ev.pageX, ev.pageY);
    });

    document.addEventListener('click', () => this.hide());

    this.el.addEventListener('click', (ev) => {
        var tgt = ev.target.closest('li');
        if(!this.el.contains(tgt)) return false;
        var action = tgt.dataset.action,
            target = tgt.closest('.menu').dataset.target;

        handlers[action](target, ev, ev.target);

    });
  }

  show(x, y) {
    Object.assign(this.el.style, {
        display: 'block',
        left: x + 'px',
        top: y + 'px'
    });
  }

  hide() {
    this.el.style.display = 'none';
  }

}

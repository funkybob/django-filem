/*
 * Menu(menu element, context element, handlers map)
 *
 */
function Menu(el, target, handlers) {
    this.el = element(el);
    this.target = element(target);

    this.target.addEventListener('contextmenu', (ev) => {
        if(!ev.target.matches('span')) return false;
        ev.preventDefault();
        this.el.dataset.target = ev.target.parentNode.dataset.path;
        this.show(ev.pageX, ev.pageY);
    }));

    document.addEventListener('click', this.hide.bind(this));

    this.el.addEventListener('click', (ev) => {
        if(!ev.target.matches('li')) return false;
        var action = ev.target.dataset.action,
            target = ev.target.parentNode.parentNode.dataset.target;

        handlers[action](target, ev, ev.target);

    });

    return this;
}

Menu.prototype = {
    show: function (x, y) {
        this.el.style.display = 'block';
        this.el.style.left = x+ 'px';
        this.el.style.top = y + 'px';
    },
    hide: function () {
        this.el.style.display = 'none';
    }
}

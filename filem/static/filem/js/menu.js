/*
 * Menu(menu element, context element, handlers map)
 *
 */
function Menu(el, target, handlers) {
    this.el = element(el);
    this.target = element(target);

    this.target.addEventListener('contextmenu', function (ev) {
        var tgt = delegate(ev, this.target, 'span');
        if(tgt === false) return;
        ev.preventDefault();
        this.el.dataset.target = tgt.parentNode.dataset.path;
        this.show(ev.pageX, ev.pageY);
    }.bind(this));

    document.addEventListener('click', this.hide.bind(this));

    this.el.addEventListener('click', function (ev) {
        var tgt = delegate(ev, this.el, 'li');
        if(tgt === false) return;
        var action = tgt.dataset.action,
            target = tgt.parentNode.parentNode.dataset.target;

        handlers[action](target, ev, tgt);

    }.bind(this));

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

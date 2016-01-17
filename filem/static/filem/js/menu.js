/*
 * Menu(menu element, context element, handlers map)
 *
 */
function Menu(el, target, handlers) {
    this.el = element(el);
    this.target = element(target);

    $(this.target).on('contextmenu', 'span', function (ev) {
        ev.preventDefault();
        this.el.dataset.target = ev.currentTarget.parentNode.dataset.path;
        this.show(ev.pageX, ev.pageY);
    }.bind(this));

    document.addEventListener('click', this.hide.bind(this));

    $(this.el).on('click', 'li', function (ev) {
        var el = ev.currentTarget,
            action = el.dataset.action,
            target = el.parentNode.parentNode.dataset.target;

        handlers[action](target, ev, el);

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

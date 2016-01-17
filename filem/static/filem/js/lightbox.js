
function Lightbox(el, options) {
    if(typeof el == 'string') {
        this.el = document.querySelector(el);
    } else {
        this.el = el;
    }
    this.$ = $(this.el);

    this.options = $.extend({}, {
    }, options);

    $(this.el.parentNode).on('click', function (ev) {
        if(ev.target == this.el.parentNode) { this.hide(); }
    }.bind(this));

    return this;
}
Lightbox.prototype = {
    show: function (content) {
        var e = new Event('show');
        if(this.el.dispatchEvent(e)) {
            if(content !== undefined) {
                this.set_content(content);
            }
            this.el.parentNode.style.display = 'flex';
        }
    },
    show_spinner: function () {
        this.show('<span class="spinner"></span>');
    },
    hide: function () {
        var e = new Event('hide');
        if(this.el.dispatchEvent(e)) {
            this.el.parentNode.style.display = 'none';
        }
    },
    set_content: function (content) {
        this.el.innerHTML = content;
    }
};

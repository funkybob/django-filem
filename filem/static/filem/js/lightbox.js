
function Lightbox(el) {
    this.el = element(el);

    this.el.parentElement.addEventListener('click', function (ev) {
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
    show_form: function () {
        this.show(content);
        this.el.querySelector('input, textarea, select').focus();
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
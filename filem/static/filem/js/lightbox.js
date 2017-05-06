
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
    show_form: function (opts) {
        var templates = {
            '': '<div><label>{label}</label><input type="{type}" name="{name}"></div>',
            'label': '<div><label>{label}</label></div>',
            'textarea': '<div><label>{label}</label><textarea name="{name}"></textarea>'
        }
        // build field list
        var fields = opts.fields.map(function (field) {
            // XXX Handle textarea, select...
            tmpl = field['template'] || templates[field.type] || templates[''];
            return tmpl.format(field)
        }).join('\n');
        // build button list
        var buttons = opts.buttons.map(function (button) {
            return `<li><button type="button" name="${button.name}" data-action="${button.action}">${button.label}</li>`;
        }).join('\n');
        // build content
        this.show(`<form> <fieldset>${fields}</fieldset> <ul class="form-buttons">{buttons}</ul> </form>`);
        this.el.querySelector('input, textarea, select').focus();
        this.el.on('click', 'button', function (ev) {
            this.el.dispatchEvent(new CustomEvent('button', {detail: ev.currentTarget.datamap.action}));
        }.bind(this))
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

var current_path;

function json (response) { return response.json(); }

function render_tree(nodelist) {
    var c = '';
    nodelist.forEach(function (node) {
        var is_open = node.path.startsWith(current_path);
        c += '<li data-path="' + node.path + '">' +
                '<span>' + node.name + '</span>';
        if(node.children.length > 0) {
            c += '<ul>';
            c += render_tree(node.children);
            c += '</ul>';
        }
        c += '</li>';
    });
    return c;
}

function render_dir_tree(data) {
    var tree = document.querySelector('#tree');
    var content = '<ul>';
    content += render_tree([
        {path: '', name: '/', children: data.tree}
    ]);
    content += '</ul>';
    tree.innerHTML = content;
    preen_tree();
}

/*
** Update the open class on tree nodes for current path
*/
function preen_tree() {
    var nodes = document.querySelectorAll('nav li');
    for(var i=0, l=nodes.length; i < l ; i++) {
        var el = nodes.item(i);
        el.classList[(current_path === el.dataset['path']) ? 'add' : 'remove']('current');
        if(current_path !== '' && current_path.startsWith(el.dataset['path'])) {
            el.classList.add('open');
        } else {
            el.classList.remove('open');
        }
    }
}

function render_file_list(data) {
    var main = document.querySelector('#files');
    var c = '<ul data-path="' + data.path + '">';
    data.files.forEach(function (node) {
        c += '<li data-name="' + node.name + '" data-type="' + node['content-type'] + '">' + 
                '<img src="' + node.thumb + '">' +
                '<p>' + node.name + '</p>' +
            '</li>';
    });
    c += '</ul>';
    main.innerHTML = c;
}

function set_current_path(path) {
    if(path == current_path) { return; }
    history.pushState({}, '', '#' + path);
    current_path = path;
    document.querySelector('#title span').innerHTML = current_path;
    preen_tree();
    fetch('files/' + path, {credentials: 'same-origin'}).then(json).then(render_file_list);
}

$(function () {
    fetch('tree/', {credentials: 'same-origin'}).then(json).then(render_dir_tree);
    set_current_path(document.location.hash.substr(1));
    $(document).on('click', function (ev) { $('.menu').hide(); });
    $('#tree').on('dblclick', 'li', function (ev) {
        set_current_path(this.dataset['path']);
    });
    $('#tree').on('contextmenu', 'li', function (ev) {
        ev.preventDefault();
        $('#dir-menu').css({
            display: 'block',
            top: ev.pageY,
            left: ev.pageX
        });
    });
    $('#files').on('dblclick', "li", function (ev) {
        if(this.dataset['type'] == 'inode/directory') {
            set_current_path(this.parentElement.dataset['path'] + '/' + this.dataset['name']);
            return;
        }
    });
    window.onpopstate = function () {
        set_current_path(document.location.hash.substr(1));
    };
});

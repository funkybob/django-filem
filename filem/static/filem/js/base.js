var current_path;
var open_nodes = {'': true};

var lb;

function check_status(response) {
    if(response.status >= 200 && response.status < 300) { return response; }
    var err = new Error(response.statusText);
    err.response = response;
    throw err;
}
function json (response) { return response.json(); }

function render_tree_nodes(nodelist) {
    var c = '';
    nodelist.forEach(function (node) {
        var is_open = node.path.startsWith(current_path);
        c += '<li data-path="' + node.path + '">' +
                '<span>' + node.name + '</span>';
        if(node.children.length > 0) {
            c += '<ul>';
            c += render_tree_nodes(node.children);
            c += '</ul>';
        }
        c += '</li>';
    });
    return c;
}

function render_dir_tree(data) {
    var tree = document.querySelector('#tree');
    var content = '<ul>';
    content += render_tree_nodes([
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
        var el = nodes.item(i),
            path = el.dataset.path;
        el.classList[current_path.startsWith(path) ? 'add' : 'remove']('current');
        el.classList[(path in open_nodes) ? 'add' : 'remove']('open');
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
    refresh_files(path);
}

function refresh_files(path) {
    path = path || current_path;
    fetch('files/' + path, {credentials: 'same-origin'})
        .then(check_status)
        .then(json)
        .then(render_file_list)
        .catch(function (error) {
            render_file_list({path: current_path, files: []});
        });
}

$(function () {
    $(document).on('click', function (ev) { $('.menu').hide(); });
    $('#tree').on({
        'click': function (ev) {
            set_current_path(this.dataset.path);
        },
        'dblclick': function (ev) {
            var path = this.dataset.path;
            if(path !== '' && (path in open_nodes)) {
                delete open_nodes[path];
            } else {
                open_nodes[path] = true;
            }
            preen_tree();
        },
    }, 'li');
    $('#tree').on('contextmenu', 'span', function (ev) {
        ev.preventDefault();
        var el = document.querySelector('#dir-menu');
        el.dataset.target = ev.currentTarget.parentNode.dataset.path;
        el.style.display = 'block';
        el.style.left = ev.pageX + 'px';
        el.style.top = ev.pageY + 'px';
    });
    $('#files').on('dblclick', "li", function (ev) {
        var path = this.parentElement.dataset.path + '/' + this.dataset.name,
            ctype = this.dataset.type;
        if(ctype == 'inode/directory') {
            set_current_path(path);
        }
        else if(ctype.startsWith('image/')) {
            lb.show('<div class="lb-image"><img src="/media/' + path + '"></div>');
        }
        else if(ctype.startsWith('text/')) {
            lb.show_spinner();
            fetch('/media/' + path)
                .then(check_status)
                .then(function (resp) { return resp.text(); })
                .then(function (text) {
                    lb.set_content('<pre>' + text + '</pre>');
                });
        }
    });
    window.onpopstate = function () {
        set_current_path(document.location.hash.substr(1));
    };

    $('#dir-menu').on('click', 'li', function (ev) {
        var action = this.dataset.action,
            // li -> ul -> nav
            target = this.parentNode.parentNode.dataset.target;
        switch(action) {
        case 'create':
            lb.show(
            '<form>' +
                '<label>Name: <input type="text" name="name"></label>' +
                '<button type="button">Create</button>' +
            '</form>'
            );
            function handleCreateDir(ev) {
            }
            var button = lb.el.querySelector('button');
            button.addEventListener('click', handleCreateDir);
            lb.el.addEventListener('hide', function () {
                button.removeEventListener('click', handleCreateDir);
            });
            break;
        case 'rename':
        case 'info':
        case 'delete':
        case 'download':
        default:
            break;
        }
    });

    $('button').on('click', function (ev) {
        var form = document.querySelector('#dropzone form');
        var data = new FormData(form);
        data.append('path', current_path);
        fetch('upload/', {method: 'post', body: data, credentials: 'same-origin'})
            .then(check_status)
            .then(refresh_files);
    });

    lb = new Lightbox('#lightbox');

    // Pre-seed the open_node list
    var parts = document.location.hash.substr(1).split('/');
    var path = '';
    for(var i=0, l=parts.length; i < l ; i++) {
        if(path === '' ) { path = parts[i]; }
        else { path = path + '/' + parts[i]; }
        open_nodes[path] = true;
    }
    set_current_path(path);
    fetch('tree/', {credentials: 'same-origin'})
        .then(check_status)
        .then(json)
        .then(render_dir_tree);

});

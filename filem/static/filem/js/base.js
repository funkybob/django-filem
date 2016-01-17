var lb, dirlist, filelist;

$(function () {
    $(document).on('click', function (ev) { $('.menu').hide(); });
    $('#tree').on('contextmenu', 'span', function (ev) {
        ev.preventDefault();
        var el = document.querySelector('#dir-menu');
        el.dataset.target = ev.currentTarget.parentNode.dataset.path;
        el.style.display = 'block';
        el.style.left = ev.pageX + 'px';
        el.style.top = ev.pageY + 'px';
    });
    window.onpopstate = function () {
        dirlist.path = document.location.hash.substr(1);
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
                var data = new FormData(lb.el.querySelector('form'));
                data.append('target', target);
                data.append('action', action);
                post('dir/', data)
                    .then(function () {
                        lb.hide();
                        load_dir_tree();
                    });
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

    $('#dropzone button').on('click', function (ev) {
        var form = document.querySelector('#dropzone form');
        var data = new FormData(form);
        data.append('path', current_path);
        post('upload/', data)
            .then(check_status)
            .then(dirlist.load);
    });

    lb = new Lightbox('#lightbox');
    filelist = new FileList('#files');
    dirlist = new DirList('#tree');

    // Load files list on path change
    dirlist.el.addEventListener('path', function() { filelist.load(dirlist.path); });
    dirlist.set_initial_path(document.location.hash.substr(1));
    // Set dirlist path when dir is dblclicked
    filelist.el.addEventListener('setpath', function(ev) { dirlist.path = ev.detail; });
});

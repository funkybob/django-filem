import mimetypes
from pathlib import PurePath, Path

from django.conf import settings
from django.contrib.auth.decorators import user_passes_test
from django.contrib.staticfiles.templatetags.staticfiles import static

from easy_thumbnails.files import Thumbnailer


ROOT = Path(settings.MEDIA_ROOT).resolve()

staff_required = user_passes_test(lambda u: u.is_staff)


def safe_join(root, path):
    '''
    Safely join two paths, and resolve as an absolute, ensuring the result is
    still under the root.
    '''
    p_root = Path(root).resolve()
    p_path = PurePath(path)

    p_full = (p_root / p_path).resolve()
    p_full.relative_to(p_root)
    return p_full


def dir_tree(root):
    '''
    Recursively produces a tree of directory info.
    '''
    return sorted([
        {
            'name': p.name,
            'path': str(p.relative_to(ROOT)),
            'children': dir_tree(p),
        }
        for p in root.iterdir()
        if p.is_dir()
    ], key=lambda x: x['name'])


def file_details(path):
    '''
    Returns a dict of info about a Path
    '''
    st = path.stat()
    content_type, encoding = mimetypes.guess_type(path.name)

    if path.is_dir():
        img = static('filem/img/mimetypes/inode-directory.png')
        content_type = 'inode/directory'
    elif content_type is None:
        img = static('filem/img/mimetypes/unknown.png')
    elif content_type.startswith('image/'):
        tf = Thumbnailer(name=str(path.relative_to(ROOT)))
        img = tf.get_thumbnail({
            'size': (64, 64),
            'crop': 'auto',
        }).url
    else:
        try:
            img = static('filem/img/mimetypes/%s.png' % (content_type.replace('/', '-'),))
        except:
            img = static('filem/img/mimetypes/unknown.png')
    return {
        'name': path.name,
        'is_dir': path.is_dir(),
        'is_file': path.is_file(),
        'is_symlink': path.is_symlink(),
        'size': st.st_size,
        'mode': st.st_mode,
        'mtime': st.st_mtime,
        'ctime': st.st_ctime,
        'content-type': content_type,
        'encoding': encoding,
        'thumb': img,
    }


import mimetypes
from pathlib import PurePath, Path

from django.conf import settings
from django.contrib.auth.decorators import user_passes_test
from django.http import JsonResponse, Http404
from django.shortcuts import render

staff_required = user_passes_test(lambda u: u.is_staff)

ROOT = Path(settings.MEDIA_ROOT).resolve()


@staff_required
def index(request):
    return render(request, 'filem/index.html')


def safe_join(root, path):
    '''
    Safely join two paths, and resolve as an absolute, ensuring the result is still under the root.
    '''
    p_root = Path(root).resolve()
    p_path = PurePath(path)

    p_full = (p_root / p_path).resolve()
    p_full.relative_to(p_root)
    return p_full


def _dump_entry(de):
    st = de.stat()
    mt = mimetypes.guess_type(de.name)
    return {
        'name': de.name,
        'is_dir': de.is_dir(),
        'is_file': de.is_file(),
        'is_symlink': de.is_symlink(),
        'size': st.st_size,
        'mode': st.st_mode,
        'mtime': st.st_mtime,
        'ctime': st.st_ctime,
        'content-type': mt[0],
        'encoding': mt[1],
    }


@staff_required
def dir_info(request, path=''):
    '''
    Returns a list of entries in the given directory.
    '''
    try:
        full_path = safe_join(ROOT, path)
    except (FileNotFoundError, ValueError):
        raise Http404

    return JsonResponse({
        'path': str(full_path.relative_to(ROOT)),
        'files': [
            _dump_entry(de)
            for de in full_path.iterdir()
        ]
    }, safe=False)


def _listdir(root):
    return [
        {
            'name': p.name,
            'path': str(p.relative_to(ROOT)),
            'children': _listdir(p),
        }
        for p in root.iterdir()
        if p.is_dir()
    ]


@staff_required
def tree(request):
    '''
    Returns a full directory tree as a map of paths -> [list of children]
    '''
    return JsonResponse({
        'tree': _listdir(ROOT),
    })

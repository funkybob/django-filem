
from django.http import JsonResponse, Http404
from django.shortcuts import render

from . import utils


@utils.staff_required
def index(request):
    return render(request, 'filem/index.html')


@utils.staff_required
def dir_info(request, path=''):
    '''
    Returns a list of entries in the given directory.
    '''
    try:
        full_path = utils.safe_join(utils.ROOT, path)
    except (FileNotFoundError, ValueError):
        raise Http404

    return JsonResponse({
        'path': str(full_path.relative_to(utils.ROOT)),
        'files': [
            utils.file_details(path)
            for path in full_path.iterdir()
        ]
    })


@utils.staff_required
def tree(request):
    '''
    Returns a full directory tree as a map of paths -> [list of children]
    '''
    return JsonResponse({
        'tree': utils.dir_tree(utils.ROOT),
    })

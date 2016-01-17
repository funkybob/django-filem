
from django.http import JsonResponse, Http404
from django.shortcuts import render
from django.views.decorators.http import require_POST

from . import utils
from .auth import staff_required


@staff_required
def index(request):
    return render(request, 'filem/index.html')


@staff_required
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
            for path in sorted(full_path.iterdir())
        ]
    })


@staff_required
def tree(request):
    '''
    Returns a full directory tree as a map of paths -> [list of children]
    '''
    return JsonResponse({
        'tree': utils.dir_tree(utils.ROOT),
    })


@staff_required
@require_POST
def dir_action(request):
    action = request.POST['action']
    target = request.POST['target']
    if action == 'create':
        name = request.POST['name']
        p = utils.safe_join(utils.ROOT, target, name)
        p.mkdir()

    return JsonResponse({})


@staff_required
@require_POST
def file_action(request):
    pass

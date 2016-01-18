import zipfile

from django.http import JsonResponse, Http404, HttpResponse, HttpResponseBadRequest
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
    try:
        base_path = utils.safe_join(utils.ROOT, target)
    except ValueError:
        return HttpResponseBadRequest('Invalid Path')
    if action == 'rename':
        pass
    elif action == 'create':
        name = request.POST['name']
        p = utils.safe_join(base_path, name)
        p.mkdir()
    elif action == 'delete':
        pass
    elif action == 'download':
        response = HttpResponse()
        response['Content-Disposition'] = 'attachment; filename={}_{}.zip'.format(target,)
        with zipfile.ZipFile(response, compression=zipfile.ZIP_DEFLATED) as zf:
            for path in base_path.glob('**/*'):
                if path.is_dir():
                    continue
                zf.write(str(path), arcname=str(path.relative_to(utils.ROOT)))
        return response

    return JsonResponse({})


@staff_required
@require_POST
def file_action(request):
    pass

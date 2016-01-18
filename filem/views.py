import zipfile

from django.http import JsonResponse, Http404, HttpResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.views.decorators.http import require_POST

from . import forms, utils
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
    form = forms.DirActionForm(request.POST)
    if not form.is_valid():
        return HttpResponseBadRequest(form.errors.as_json(), content_type='application/json')

    action = form.cleaned_data['action']
    target = form.cleaned_data['target']

    if action == 'rename':
        name = form.cleaned_data['name']
        target.rename(name)
    elif action == 'create':
        name = form.cleaned_data['name']
        p = target / name
        p.mkdir()
    elif action == 'delete':
        target.unlink()
    elif action == 'download':
        response = HttpResponse()
        filename = str(target.relative_to(utils.ROOT)).replace('/', '_')
        response['Content-Disposition'] = 'attachment; filename={}_{}.zip'.format(filename,)
        with zipfile.ZipFile(response, compression=zipfile.ZIP_DEFLATED) as zf:
            for path in target.glob('**/*'):
                if path.is_dir():
                    continue
                zf.write(str(path), arcname=str(path.relative_to(utils.ROOT)))
        return response

    return JsonResponse({})


@staff_required
@require_POST
def file_action(request):
    pass

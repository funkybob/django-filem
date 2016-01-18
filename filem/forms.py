from django import forms
from django.core.validators import RegexValidator

from . import utils


class DirActionForm(forms.Form):
    action = forms.ChoiceField(choices=[(x, x) for x in ('rename', 'delete', 'download', 'create')], required=True)
    target = forms.CharField(required=True)
    # Must not start with a .
    # Must only contain  alphanum, hyphen, underscore, or '.'
    name = forms.CharField(validators=[RegexValidator(r'^[^\.][-\w\.]+$')], required=False)

    def clean_target(self):
        target = self.cleaned_data['target']
        try:
            path = utils.safe_join(utils.ROOT, target)
        except ValueError:
            raise forms.ValidationError('Invalid path')
        return path

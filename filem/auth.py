from django.contrib.auth.decorators import user_passes_test

staff_required = user_passes_test(lambda u: u.is_staff)

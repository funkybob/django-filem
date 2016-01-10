# django-filem
A simple media file manager for Django

## Quick Install

1. Install requirements
2. Add to INSTALLED_APPS

  ```
  INSTALLED_APPS = [
      'django.contrib.admin',
      'django.contrib.auth',
      'django.contrib.contenttypes',
      'django.contrib.sessions',
      'django.contrib.messages',
      'django.contrib.staticfiles',
  
      'filem',
      'easy_thumbnails',
  ]
  ```

2. Add to urls:

  ```
  urlpatterns = [
      url(r'^admin/', admin.site.urls),
      url(r'^_/', include('filem.urls')),
  ]
  ```

3. Set your MEDIA settings:

  ```
  MEDIA_URL = '/media/'
  MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
  
  # Not required, but keeps them out of the way
  THUMBNAIL_BASEDIR = 'thumbs'
  ```

4. Add the 64x64/mimetypes images from https://github.com/pasnox/oxygen-icons-png to static/filem/img/mimetypes

5. Log in and visit the page.

## Current features

+ Show and traverse the dir tree (uses push state)
+ list the files
+ put thumbnails for images

## Pending features

+ Upload file(s)
+ Rename file/dir
+ Drag'n'drop move file/dir
+ Delete file/dir
+ Upload ZIP
+ Download ZIP
+ Edit text files
+ Copy url

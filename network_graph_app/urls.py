__author__ = 'hanter'

from django.conf.urls import url
from . import views

app_name = 'miaas'
urlpatterns = [
    url(r'^$', views.main_page, name='main')
]

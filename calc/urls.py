from django.urls import path

from . import views

app_name = 'calc'

urlpatterns = [
    path('', views.index, name='index'),
    path('calculate/', views.calculate, name='calculate'),
    path('memory/clear/', views.clear_memory, name='clear_memory'),
]

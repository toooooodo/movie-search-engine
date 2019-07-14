from django.urls import path, re_path

from search import views

urlpatterns = [
    # path("search_result/", views.search_result),
    path("write/", views.do_search, name='do_search'),
]

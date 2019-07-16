from django.urls import path, re_path

from search import views

urlpatterns = [
    # path("search_result/", views.search_result),
    path("movie_search/", views.do_search, name='do_search'),
    path('movie_detail/', views.movie, name='movie'),
    path('answer/', views.answer, name='answer'),
    path('rec_movie/', views.recommand, name='recommand'),
]

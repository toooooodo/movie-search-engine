from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, redirect
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search
from elasticsearch_dsl import DocType, Date, Nested, Boolean, Integer, \
    analyzer, Completion, Keyword, Text, Q, InnerObject
from search.models import Movie
import json, uuid
from django.http import HttpResponse
from django.shortcuts import render


# def index(request):
#     return render(request, 'test.html')

#
# def search_result(request):
#     print(request)
#     if request.method == "GET":
#         print(request.GET['movie_name'])
#         name = request.GET['movie_name']
#         from elasticsearch_dsl.connections import connections
#         connections.create_connection(hosts=["localhost"])
#
#         s = Movie.search()
#         # s = s.query("match", title="游戏")
#         # s = s.filter('terms', categories=['喜剧', '冒险'])
#         s = Search.from_dict({
#             "query": {
#                 "bool": {
#                     "must": [
#                         {
#                             "nested": {
#                                 "path": "categories",
#                                 "query": {
#                                     "match": {
#                                         "categories.category": "悬疑"
#                                     }
#                                 }
#                             }
#                         },
#                         {
#                             "match": {
#                                 "title": name
#                             }
#                         }
#                     ]
#                 }
#
#             }})
#         # s = s[20:30]
#
#         response = s.execute()
#         print(response)
#         for hit in response.hits:
#             print(hit.title, hit.rating)
#
#     return render(request, 'test.html')


def do_search(request):
    data = json.loads(request.body)
    print('data', data)
    data['id'] = uuid.uuid4()

    from elasticsearch_dsl.connections import connections
    connections.create_connection(hosts=["localhost"])

    s = Movie.search()
    if data['searchType'] == 0:
        s = s.query("match", title=data['input'])
    elif data['searchType'] == 1:
        s = Search.from_dict({
            "query": {
                "bool": {
                    "must": [
                        {
                            "nested": {
                                "path": "actors",
                                "query": {
                                    "match": {
                                        "actors.actor": data['input']
                                    }
                                }
                            }
                        }
                    ]
                }
            }})
    elif data['searchType'] == 2:
        s = Search.from_dict({
            "query": {
                "bool": {
                    "must": [
                        {
                            "nested": {
                                "path": "directors",
                                "query": {
                                    "match": {
                                        "directors.director": data['input']
                                    }
                                }
                            }
                        }
                    ]
                }

            }})
    response = s.execute()
    # print(response)
    # print(response.hits.total)

    thisMovie = {}
    index = 0

    res = []

    while index < response.hits.total:
        s = s[index: index + 10]
        response = s.execute()

        for hit in response.hits:
            print(hit)
            actor_list = []
            if hit.__contains__('img'):
                thisMovie['img'] = hit.img
            thisMovie['title'] = hit.title
            if hit.__contains__('rating'):
                thisMovie['rating'] = hit.rating
            thisMovie['id'] = hit.id
            if hit.__contains__('actors'):
                for actor in hit.actors:
                    if actor.__contains__('actor'):
                        actor_list.append(actor['actor'])
            # else:
            #     print(hit.title)
            thisMovie['actors'] = actor_list

            res.append(thisMovie.copy())
            index += 1


    return HttpResponse(json.dumps(res), content_type='application/json')

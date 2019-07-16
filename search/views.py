from django.shortcuts import render

# Create your views here.
from elasticsearch_dsl import Search
# from search.models import MyUser
from search.models import Movie, Question, Recommand, Record
import json, uuid
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect

q = Question()
re = Recommand()
record = Record()


def do_search(request):
    data = json.loads(request.body)
    data['id'] = uuid.uuid4()
    res = []

    from elasticsearch_dsl.connections import connections
    connections.create_connection(hosts=["localhost"])

    # 过滤条件
    time_low = {'0': 0, '1': 2011, '2': 2001, '3': 1991, '4': 1981, '5': 1971, '6': 0}
    time_high = {'0': 3000, '1': 3000, '2': 2010, '3': 2000, '4': 1990, '5': 1980, '6': 1970}

    type = {'0': "all_type", '1': '喜剧', '2': '恐怖', '3': '动作', '4': '剧情', '5': '家庭', '6': '科幻'}

    # 测试其他过滤条件
    print("time_low:", time_low[data['Time']], ", time_high:", time_high[data['Time']], ", type:", type[data['Type']])

    lower_time = time_low[data['Time']]
    higher_time = time_high[data['Time']]
    movie_type = type[data['Type']]

    s = Movie.search()

    # 判断查询类型
    if len(data['searchType']) == 0 or data['searchType'][0] == '按电影名搜索':
        s = s.query("match", title=data['input'])
    elif data['searchType'][0] == '按影星搜索':
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
    elif data['searchType'][0] == '按导演搜索':
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

    thisMovie = {}
    index = 0

    # 遍历所有搜索结果
    while index < response.hits.total:
        s = s[index: index + 10]
        response = s.execute()

        for hit in response.hits:
            actor_list = []
            type_list = []

            # 获取图像url
            if hit.__contains__('img'):
                thisMovie['img'] = hit.img
            else:
                thisMovie['img'] = '/static/media/default.1fa9cf77.png'
            thisMovie['title'] = hit.title
            # 获取评分
            if hit.__contains__('rating'):
                thisMovie['rating'] = hit.rating
            thisMovie['id'] = hit.id
            # 获取
            if hit.__contains__('actors'):
                for actor in hit.actors:
                    if actor.__contains__('actor'):
                        actor_list.append(actor['actor'])
            thisMovie['actors'] = actor_list

            if hit.__contains__('date'):
                tmpTime = hit.date
            else:
                tmpTime = 0

            for category in hit.categories:
                if category.__contains__('category'):
                    type_list.append(category['category'])

            # 时间过滤
            if lower_time <= tmpTime <= higher_time:
                # print("tmpTime:" , tmpTime)
                # 类型过滤
                if movie_type == "all_type" or movie_type in type_list:
                    # print("movie_type:", movie_type, "tmpTime:", tmpTime)
                    res.append(thisMovie.copy())

            index += 1

    return HttpResponse(json.dumps(res), content_type='application/json')


def movie(request):
    data = json.loads(request.body)
    id = data['id']
    print(id)
    from elasticsearch_dsl.connections import connections
    connections.create_connection(hosts=["localhost"])

    s = Movie.search()
    s = s.query("match", id=id)
    result = s.execute().hits[0]

    this_movie = dict()
    actor_list, director_list, comment_list, category_list, comment_time_list, comment_rate_list = [], [], [], [], [], []
    # print(result)
    if result.__contains__('title'):
        this_movie['title'] = result.title
    else:
        this_movie['title'] = ''
    if result.__contains__('img'):
        this_movie['img'] = result.img
    else:
        this_movie['img'] = '/static/media/default.1fa9cf77.png'
    if result.__contains__('other_title'):
        this_movie['other_title'] = result.other_title
    else:
        this_movie['other_title'] = '暂无'
    if result.__contains__('categories'):
        for category in result.categories:
            if category.__contains__('category'):
                category_list.append(category['category'])
            else:
                category.append('暂无')
    else:
        category_list.append('暂无')
    this_movie['categories'] = category_list

    if result.__contains__('location'):
        this_movie['location'] = result.location
    else:
        this_movie['location'] = '暂无'
    if result.__contains__('length'):
        this_movie['length'] = result.length
    else:
        this_movie['length'] = 0
    if result.__contains__('date'):
        this_movie['date'] = result.date
    else:
        this_movie['date'] = '不详'
    if result.__contains__('rating'):
        this_movie['rating'] = result.rating
    else:
        this_movie['rating'] = 0
    if result.__contains__('actors'):
        for actor in result.actors:
            if actor.__contains__('actor'):
                actor_list.append(actor['actor'])
            else:
                actor_list.append('暂无演员信息')
    else:
        actor_list.append('暂无演员信息')
    this_movie['actors'] = actor_list
    if result.__contains__('directors'):
        for director in result.directors:
            if director.__contains__('director'):
                director_list.append(director['director'])
            else:
                director_list.append('暂无导演信息')
    else:
        director_list.append('暂无导演信息')
    this_movie['directors'] = director_list

    if result.__contains__('hot_extent'):
        this_movie['video_num'] = format((result.hot_extent[0]['video_num'] * 100 / 115), '.1f')
        this_movie['photo_num'] = format((result.hot_extent[0]['photo_num'] * 100 / 1000), '.1f')
        this_movie['rating_num'] = format((result.hot_extent[0]['rating_num'] * 100 / 1000), '.1f')
        this_movie['news_num'] = format((result.hot_extent[0]['news_num'] * 100 / 1000), '.1f')
    else:
        this_movie['video_num'] = '0'
        this_movie['photo_num'] = '0'
        this_movie['rating_num'] = '0'
        this_movie['news_num'] = '0'

    if result.__contains__("detail"):
        this_movie['detail'] = result.detail
    else:
        this_movie['detail'] = "暂无简介！"

    if result.__contains__('comments'):
        for comment in result.comments:
            if comment.__contains__('content'):
                comment_list.append(comment['content'])
            else:
                comment_list.append('暂无')
            if comment.__contains__('date'):
                comment_time_list.append(str(comment['date']).split()[0])
            else:
                comment_time_list.append('暂无')
            if comment.__contains__('score'):
                comment_rate_list.append(comment['score'])
            else:
                comment_rate_list.append(0)
    else:
        comment_list.append('暂无')
        comment_time_list.append('暂无')
        comment_rate_list.append(0)

    this_movie['comment_text_list'] = comment_list
    this_movie['comment_time_list'] = comment_time_list
    this_movie['comment_rate_list'] = comment_rate_list

    # print(json.dumps(result.body))
    record.add(id)
    response = HttpResponse(json.dumps(this_movie), content_type='application/json')
    # response = JsonResponse(this_movie, request)
    # request.session['record'] = ','.join(record)
    print(record.get_cloud())
    # response.set_cookie('record', ','.join(record), max_age=7 * 24 * 3600, path='/', domain='.localhost')
    return response


def answer(request):
    data = json.loads(request.body)
    res = {"answer": q.process(data['question'])}

    return HttpResponse(json.dumps(res), content_type='application/json')


def recommend(request):
    data = json.loads(request.body)
    id = data['id']
    return HttpResponse(json.dumps(re.process(record.get_list())), content_type='application/json')


def get_words(request):
    print('get_words')
    return HttpResponse(json.dumps(record.get_cloud()), content_type='application/json')

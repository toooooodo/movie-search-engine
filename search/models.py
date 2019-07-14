from django.db import models

# Create your models here.

from datetime import datetime
from elasticsearch_dsl import DocType, Date, Nested, Boolean, \
    analyzer, InnerObjectWrapper, Completion, Keyword, Text, Integer, Float
from elasticsearch_dsl.connections import connections
from elasticsearch_dsl.analysis import CustomAnalyzer as _CustomAnalyzer

connections.create_connection(hosts=['localhost'])


class CustomAnalyzer(_CustomAnalyzer):
    def get_analysis_definition(self):
        return {}


ik_analyzer = CustomAnalyzer('ik_max_word', filter=['lowercase'])


class Movie(DocType):
    id = Integer()
    url = Keyword()
    title = Text(analyzer='ik_max_word')
    other_title = Text(analyzer='snowball')
    categories = Nested(
        properties={
            'category': Keyword()
        }
    )
    location = Text()
    length = Integer()
    date = Integer()
    directors = Nested(
        properties={
            'director': Text()
        }
    )
    actors = Nested(
        properties={
            'actor': Text()
        }
    )
    detail = Text(analyzer='ik_max_word')
    img = Keyword()
    rating = Float()
    hot_extent = Nested(
        properties={
            'video_num': Integer(),
            'photo_num': Integer(),
            'rating_num': Integer(),
            'news_num': Integer(),
        }
    )
    comments = Nested(
        # doc_class=Comment,
        properties={
            'date': Date(),
            'score': Float(),
            'content': Text(analyzer='ik_max_word'),
        }
    )
    suggest = Completion(analyzer=ik_analyzer)

    class Meta:
        index = 'movie-search'
        doc_type = 'movie'

    def add_category(self, cat):
        self.categories.append({'category': cat})

    def add_director(self, director):
        self.directors.append({'director': director})

    def add_actor(self, actor):
        self.actors.append({'actor': actor})

    def set_hot_extent(self, video, photo, rating, news):
        self.hot_extent.append({
            'video_num': video, 'photo_num': photo, 'rating_num': rating, 'news_num': news
        })

    def add_comment(self, date, score, content):
        if score is not None:
            self.comments.append({
                'date': date, 'score': score, 'content': content,
            })
        else:
            self.comments.append({
                'date': date, 'content': content,
            })


if __name__ == '__main__':
    Movie.init()

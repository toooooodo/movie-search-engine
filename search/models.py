import os

from django.db import models

# Create your models here.

import jieba as jb
from jieba import posseg
import re
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from elasticsearch_dsl import DocType, Date, Nested, Boolean, \
    analyzer, InnerObjectWrapper, Completion, Keyword, Text, Integer, Float
from elasticsearch_dsl.connections import connections
from elasticsearch_dsl.analysis import CustomAnalyzer as _CustomAnalyzer
from py2neo import Graph, Node, Relationship, NodeMatcher
from django.conf import settings

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


class Query:
    def __init__(self):
        self.graph = Graph("http://localhost:7474", username="neo4j", password="zx")

    def query(self, cql):
        # find_rela  = test_graph.run("match (n:Person{name:'张学友'})-[actedin]-(m:Movie) return m.title")
        result = []
        find_rela = self.graph.run(cql)
        for i in find_rela:
            result.append(i.items()[0][1])
            # result.append(i.items())
        return result


class QuestionClassify:
    def __init__(self):
        # 读取训练数据
        self.train_x, self.train_y = self.read_train_data()
        # 训练模型
        self.model = self.train_model_NB()

    # 获取所有的文件
    def getfilelist(self, root_path):
        file_path_list = []
        file_name = []
        walk = os.walk(root_path)
        for root, dirs, files in walk:
            for name in files:
                filepath = os.path.join(root, name)
                file_name.append(name)
                file_path_list.append(filepath)
        return file_path_list

    # 获取训练数据
    def read_train_data(self):
        train_x = []
        train_y = []
        # with open(settings.BASE_DIR+'/static/search/question/question_classification.txt', 'r') as ff:
        #     print('yes')
        file_list = self.getfilelist(settings.BASE_DIR+"/static/search/question/")
        print('file_list', file_list)
        # 遍历所有文件
        for i, one_file in enumerate(file_list):
            # 获取文件名中的数字
            num = re.sub(r'\D', "", one_file)
            # 如果该文件名有数字，则读取该文件
            if str(num).strip() != "":
                # 设置当前文件下的数据标签
                label_num = int(num)
                # 读取文件内容
                with(open(one_file, "r", encoding="utf-8")) as fr:
                    data_list = fr.readlines()
                    for one_line in data_list:
                        word_list = list(jb.cut(str(one_line).strip()))
                        # 将这一行加入结果集
                        train_x.append(" ".join(word_list))
                        train_y.append(label_num)
        return train_x, train_y

    # 训练并测试模型-NB
    def train_model_NB(self):
        x_train, y_train = self.train_x, self.train_y
        self.tv = TfidfVectorizer()
        train_data = self.tv.fit_transform(x_train).toarray()
        clf = MultinomialNB(alpha=0.01)
        clf.fit(train_data, y_train)
        return clf

    # 预测
    def predict(self, question):
        question = [" ".join(list(jb.cut(question)))]
        test_data = self.tv.transform(question).toarray()
        y_predict = self.model.predict(test_data)[0]
        return y_predict


class QuestionTemplate:
    def __init__(self):
        self.q_template_dict = {
            0: self.get_movie_rating,
            1: self.get_movie_date,
            2: self.get_movie_type,
            3: self.get_movie_detail,
            4: self.get_movie_actor_list,
            5: self.get_actor_act_type_movie,
            6: self.get_actor_act_movie_list,
            7: self.get_movie_rating_bigger,
            8: self.get_movie_rating_smaller,
            9: self.get_actor_movie_type,
            10: self.get_cooperation_movie_list,
            11: self.get_actor_movie_num,
            12: self.get_director_list,
            13: self.get_director_movie_type_list,
            14: self.get_copperation_actor_list,
            15: self.get_direct_movie_list,
            16: self.get_direct_movie_num,
            17: self.get_director_cooperation_actor_list,
            18: self.get_movie_director_list,
            19: self.get_movie_length,
        }

        # 连接数据库
        self.graph = Query()

    def get_question_answer(self, question, template):
        # 如果问题模板的格式不正确则结束
        assert len(str(template).strip().split("\t")) == 2
        template_id, template_str = int(str(template).strip().split("\t")[0]), str(template).strip().split("\t")[1]
        self.template_id = template_id
        self.template_str2list = str(template_str).split()
        # 预处理问题
        question_word, question_flag = [], []
        for one in question:
            word, flag = one.split("/")
            question_word.append(str(word).strip())
            question_flag.append(str(flag).strip())
        assert len(question_flag) == len(question_word)
        self.question_word = question_word
        self.question_flag = question_flag
        self.raw_question = question
        # 根据问题模板来做对应的处理，获取答案
        answer = self.q_template_dict[template_id]()
        return answer

    # 获取电影名字
    def get_movie_name(self):
        # 获取nm在原问题中的下标
        tag_index = self.question_flag.index("nm")
        # 获取电影名称
        movie_name = self.question_word[tag_index]
        return movie_name

    def get_name(self, type_str):
        name_count = self.question_flag.count(type_str)
        if name_count == 1:
            # 获取nm在原问题中的下标
            tag_index = self.question_flag.index(type_str)
            # 获取电影名称
            name = self.question_word[tag_index]
            return name
        else:
            result_list = []
            for i, flag in enumerate(self.question_flag):
                if flag == str(type_str):
                    result_list.append(self.question_word[i])
            return result_list

    def get_num_x(self):
        x = re.sub(r'\D', "", "".join(self.question_word))
        return x

    # 问题0：电影评分
    def get_movie_rating(self):
        movie_name = self.get_movie_name()
        cql = f"match (m:Movie) where m.title='{movie_name}' return m.rating"
        result = self.graph.query(cql)[0]
        answer = f"《{movie_name}》的评分是{str(result)}。"
        return answer

    # 问题1：电影上映日期
    def get_movie_date(self):
        movie_name = self.get_movie_name()
        cql = f"match (m:Movie) where m.title='{movie_name}' return m.date"
        result = self.graph.query(cql)[0]
        answer = f"《{movie_name}》的上映时间是{str(result)}年。"
        return answer

    # 问题2：电影种类
    def get_movie_type(self):
        movie_name = self.get_movie_name()
        cql = f"match (m:Movie)-[:is]->(c:Category) where m.title='{movie_name}' return c"
        result = self.graph.query(cql)
        cat_list = []
        for i in result:
            cat_list.append(i['name'])
        answer = f"《{movie_name}》的类型包括" + '，'.join(cat_list) + "。"
        return answer

    # 问题3：电影详情
    def get_movie_detail(self):
        movie_name = self.get_movie_name()
        cql = f"match (m:Movie) where m.title='{movie_name}' return m.detail"
        result = self.graph.query(cql)[0]
        answer = f"《{movie_name}》的主要情节是{result}。"
        return answer

    # 问题4：电影演员
    def get_movie_actor_list(self):
        movie_name = self.get_movie_name()
        cql = f"match (m:Movie)-[:act_in]-(c:Celebrity)  where m.title='{movie_name}' return c.name"
        result = self.graph.query(cql)
        actor_list = []
        print(result)
        for i in result:
            actor_list.append(i)
        answer = f"《{movie_name}》的演员有" + '、'.join(actor_list) + "。"
        return answer

    # 问题5：演员演过该种类的电影有哪些
    def get_actor_act_type_movie(self):
        actor_name = self.get_name("nr")
        '''
        match (c:Celebrity)-[:act_in]->(m:Movie)-[:is]->(cat:Category) 
        where c.name="成龙" and cat.name="冒险" return m
        '''
        category = self.get_name("ng")
        cql = f"match (c:Celebrity)-[:act_in]->(m:Movie)-[:is]->(cat:Category) " \
              f"where c.name='{actor_name}' and cat.name='{category}' return m.title"
        result = self.graph.query(cql)
        if len(result) == 0:
            return f"{actor_name}还没有出演过{category}类的电影。"
        movie_list = []
        for i in result:
            movie_list.append('《' + i + '》')
        answer = f"{actor_name}出演的{category}类电影有" + '、'.join(movie_list) + "。"
        return answer

    # 问题6：演员演过的电影
    def get_actor_act_movie_list(self):
        actor_name = self.get_name("nr")
        '''
        match (c:Celebrity)-[:act_in]->(m:Movie) where c.name="成龙" return m
        '''
        cql = f"match (c:Celebrity)-[:act_in]->(m:Movie) where c.name='{actor_name}' return m.title"
        result = self.graph.query(cql)
        if len(result) == 0:
            return f"{actor_name}还没有出演过电影。"
        movie_list = []
        for i in result:
            movie_list.append('《' + i + '》')
        answer = f"{actor_name}出演电影有" + '、'.join(movie_list) + "。"
        return answer

    # 问题7：nr参演的评分大于x的电影
    def get_movie_rating_bigger(self):
        actor_name = self.get_name("nr")
        x = self.get_num_x()
        '''
        match (c:Celebrity)-[:act_in]->(m:Movie) where c.name="成龙" and m.rating>5.0 return m
        '''
        cql = f"match (c:Celebrity)-[:act_in]->(m:Movie) where c.name='{actor_name}' and m.rating>{x} return m.title"
        result = self.graph.query(cql)
        if len(result) == 0:
            return f"{actor_name}还没有出演过评分高于{x}的电影。"
        movie_list = []
        for i in result:
            movie_list.append('《' + i + '》')
        answer = f"{actor_name}出演的评分高于{x}的电影有" + '、'.join(movie_list) + "。"
        return answer

    # 问题8：nr参演的评分小于x的电影
    def get_movie_rating_smaller(self):
        actor_name = self.get_name("nr")
        x = self.get_num_x()
        '''
        match (c:Celebrity)-[:act_in]->(m:Movie) where c.name="成龙" and m.rating<5.0 return m
        '''
        cql = f"match (c:Celebrity)-[:act_in]->(m:Movie) where c.name='{actor_name}' and m.rating<{x} return m.title"
        result = self.graph.query(cql)
        if len(result) == 0:
            return f"{actor_name}还没有出演过评分低于{x}的电影。"
        movie_list = []
        for i in result:
            movie_list.append('《' + i + '》')
        answer = f"{actor_name}出演的评分低于{x}的电影有" + '、'.join(movie_list) + "。"
        return answer

    # 问题9：演员演过的电影种类
    def get_actor_movie_type(self):
        actor_name = self.get_name("nr")
        '''
        match (c:Celebrity)-[:act_in]->(m:Movie)-[:is]->(cat:Category) where c.name="成龙" return cat
        '''
        cql = f"match (c:Celebrity)-[:act_in]->(m:Movie)-[:is]->(cat:Category) " \
              f"where c.name='{actor_name}' return cat.name"
        result = self.graph.query(cql)
        result = list(set(result))
        cat_list = []
        for i in result:
            cat_list.append(i)
        answer = f"{actor_name}出演电影种类有" + '、'.join(cat_list) + "。"
        return answer

    # 问题10：演员A和演员B合作了哪些电影
    def get_cooperation_movie_list(self):
        actor_name_list = self.get_name('nr')
        """
        match (c1:Celebrity)-[:act_in]->(m:Movie)<-[:act_in]-(c2:Celebrity) where c1.name="葛优" and c2.name="姜文" return c1,c2,m
        """
        cql = f"match (c1:Celebrity)-[:act_in]->(m:Movie)<-[:act_in]-(c2:Celebrity) " \
              f"where c1.name='{actor_name_list[0]}' and c2.name='{actor_name_list[1]}' return m.title"
        result = self.graph.query(cql)
        movie_list = []
        for i in result:
            movie_list.append('《' + i + '》')
        answer = f"{actor_name_list[0]}和{actor_name_list[1]}合作的电影有" + '、'.join(movie_list) + "。"
        return answer

    # 问题11：某演员一共演过多少电影
    def get_actor_movie_num(self):
        actor_name = self.get_name("nr")
        '''
        match (c:Celebrity)-[:act_in]->(m:Movie) where c.name="成龙" return m
        '''
        cql = f"match (c:Celebrity)-[:act_in]->(m:Movie) where c.name='{actor_name}' return m.title"
        result = self.graph.query(cql)
        answer = f"{actor_name}共参演了{len(result)}部电影。"
        return answer

    # 问题12：和那些导演有过合作
    def get_director_list(self):
        actor_name = self.get_name('nr')
        '''
        match (c1:Celebrity)-[:act_in]->(m:Movie)<-[:direct]-(c2:Celebrity) where c1.name="姜文" return c2,m,c1
        '''
        cql = f"match (c1:Celebrity)-[:act_in]->(m:Movie)<-[:direct]-(c2:Celebrity) " \
              f"where c1.name='{actor_name}' return c2.name"
        result = self.graph.query(cql)
        director_list = list(set(result) - {actor_name})
        if len(result) == 0:
            return f"{director_list}没有和导演合作过。"
        return f"{actor_name}和" + '、'.join(director_list) + '导演有过合作。'

    # 问题13：导演过类型电影
    def get_director_movie_type_list(self):
        director_name = self.get_name('nr')
        '''
        match (c:Celebrity)-[:direct]->(m:Movie)-[:is]->(cat:Category) where c.name="姜文" return c,m,cat
        '''
        cql = f"match (c:Celebrity)-[:direct]->(m:Movie)-[:is]->(cat:Category)" \
              f" where c.name='{director_name}' return cat.name"
        result = self.graph.query(cql)
        result = list(set(result))
        return f"{director_name}导演过" + "、".join(result) + "类型的电影。"

    # 问题14：某演员和哪些演员有过合作
    def get_copperation_actor_list(self):
        actor_name = self.get_name('nr')
        '''
        match (c:Celebrity)-[:act_in]->(m:Movie)<-[:act_in]-(c2:Celebrity) where c.name="姜文" return c,m,c2
        '''
        cql = f"match (c:Celebrity)-[:act_in]->(m:Movie)<-[:act_in]-(c2:Celebrity) " \
              f"where c.name='{actor_name}' return c2.name"
        result = self.graph.query(cql)
        result = list(set(result))
        return f"{actor_name}和" + "、".join(result) + "等演员有过合作。"

    # 问题15：导演导演过的电影
    def get_direct_movie_list(self):
        director_name = self.get_name('nr')
        '''
        match (c:Celebrity)-[:direct]->(m:Movie) where c.name="姜文" return c,m
        '''
        cql = f"match (c:Celebrity)-[:direct]->(m:Movie) where c.name='{director_name}' return m.title"
        result = self.graph.query(cql)
        movie_list = []
        for i in result:
            movie_list.append('《' + i + '》')
        return f"{director_name}导演过" + '、'.join(movie_list) + '等电影。'

    # 问题16：导演导演的电影数量
    def get_direct_movie_num(self):
        director_name = self.get_name('nr')
        cql = f"match (c:Celebrity)-[:direct]->(m:Movie) where c.name='{director_name}' return m.title"
        result = self.graph.query(cql)
        return f"{director_name}导演过{len(result)}部电影。"

    # 问题17：导演和哪些演员有过合作
    def get_director_cooperation_actor_list(self):
        director_name = self.get_name('nr')
        '''
        match (c:Celebrity)-[:direct]->(m:Movie)<-[:act_in]-(c2:Celebrity) where c.name="姜文" return c,m,c2
        '''
        cql = f"match (c:Celebrity)-[:direct]->(m:Movie)<-[:act_in]-(c2:Celebrity) " \
              f"where c.name='{director_name}' return c2.name"
        result = self.graph.query(cql)
        result = list(set(result) - {director_name})
        if len(result) == 0:
            return f"{director_list}没有和演员合作过。"
        return f"{director_name}和" + '、'.join(result) + '等演员有过合作。'

    # 问题18：某电影导演
    def get_movie_director_list(self):
        movie_name = self.get_movie_name()
        '''
        match (m:Movie)<-[:direct]-(c:Celebrity) where m.title="鬼子来了" return m,c
        '''
        cql = f"match (m:Movie)<-[:direct]-(c:Celebrity) where m.title='{movie_name}' return c.name"
        result = self.graph.query(cql)
        return f"《{movie_name}》的导演是" + '、'.join(result)

    # 问题19：电影时长
    def get_movie_length(self):
        movie_name = self.get_movie_name()
        '''
        match (m:Movie) where m.title="鬼子来了" return m.length
        '''
        cql = f"match (m:Movie) where m.title='{movie_name}' return m.length"
        result = self.graph.query(cql)
        return f"《{movie_name}》一共{result[0]}分钟。"


class Question:
    def __init__(self):
        self.classify = QuestionClassify()
        self.template = QuestionTemplate()
        with(open(settings.BASE_DIR+"/static/search/question/question_classification.txt", "r", encoding="utf-8")) as f:
            question_mode_list = f.readlines()
        self.question_mode_dict = {}
        for one_mode in question_mode_list:
            # 读取一行
            mode_id, mode_str = str(one_mode).strip().split(":")
            # 处理一行，并存入
            self.question_mode_dict[int(mode_id)] = str(mode_str).strip()
        # print(self.question_mode_dict)
        self.clean_question = self.question_flag = self.question_word = None
        self.answer = None

    def process(self, question):
        # 接收问题
        raw_question = str(question).strip()
        # 对问题进行词性标注
        labeled_question = self.label(raw_question)
        # 得到问题的模板
        question_template_id_str = self.get_question_template()
        # 查询图数据库,得到答案
        self.answer = self.query_template(labeled_question, question_template_id_str)
        return self.answer

    def label(self, raw):
        jb.load_userdict(settings.BASE_DIR+'/static/search/user-dic.txt')
        clean_question = re.sub("[\s+\.\!\/_,$%^*(+\"\')]+|[+——()?【】“”！，。？、~@#￥%……&*（）]+", "", raw)
        self.clean_question = clean_question
        question_seged = posseg.cut(str(clean_question))
        question_word, question_flag, result = [], [], []
        for w in question_seged:
            temp_word = f"{w.word}/{w.flag}"
            result.append(temp_word)
            # 预处理问题
            word, flag = w.word, w.flag
            question_word.append(str(word).strip())
            question_flag.append(str(flag).strip())
        assert len(question_flag) == len(question_word)
        self.question_word = question_word
        self.question_flag = question_flag
        print(result)
        return result

    def get_question_template(self):
        # 抽象问题
        for item in ['nr', 'nm', 'ng']:
            while item in self.question_flag:
                ix = self.question_flag.index(item)
                self.question_word[ix] = item
                self.question_flag[ix] = item + "ed"
        # 将问题转化字符串
        str_question = "".join(self.question_word)
        print("抽象问题为：", str_question)
        # 通过分类器获取问题模板编号
        question_template_num = self.classify.predict(str_question)
        print("使用模板编号：", question_template_num)
        question_template = self.question_mode_dict[question_template_num]
        print("问题模板：", question_template)
        question_template_id_str = str(question_template_num) + "\t" + question_template
        return question_template_id_str

    def query_template(self, labeled_question, question_template_id_str):
        print(labeled_question)
        print(question_template_id_str)
        # 调用问题模板类中的获取答案的方法
        try:
            answer = self.template.get_question_answer(labeled_question, question_template_id_str)
        except:
            answer = "呜呜呜我还不知道。"
        return answer


if __name__ == '__main__':
    q = Question()
    print(q.process('哪些演员参演过姜文导演的电影'))

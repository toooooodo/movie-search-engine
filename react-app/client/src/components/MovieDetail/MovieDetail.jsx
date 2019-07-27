import React, { Component } from 'react';
import axios from 'axios'
import BreadcrumbCustom from '../common/BreadcrumbCustom';
import {Card, Avatar, Row, Col, Collapse, Table, Icon, Progress, Rate} from 'antd';
import './MovieDetail.less';
import actorInfo from '../../ActorInfo.json'
import {Img} from '../form/Form'
// import data from './data/test.json';
// import {red} from "colorette";
const { Meta } = Card;

export default class MIndex extends Component {

    constructor (props) {
        super(props);
        this.state = {
            name: "",
            age: 0,
            data: ""
        }

        // props.location.state.data = false;

        // this.change = this.change.bind(this);
        // this.write = this.write.bind(this);
        // this.read = this.read.bind(this);
        // this.loadCommentsFromServer = this.loadCommentsFromServer.bind(this);

        this.actors = props.location.state.actors;
        this.categories = props.location.state.categories;
        this.img = props.location.state.img;
        this.date = props.location.state.date;
        this.comment_rate_list = props.location.state.comment_rate_list
        this.comment_text_list = props.location.state.comment_text_list
        this.comment_time_list = props.location.state.comment_time_list
        this.directors =  props.location.state.directors
        this.length =  props.location.state.length
        this.location =  props.location.state.location
        this.news_num= props.location.state.news_num
        this.other_title =  props.location.state.other_title
        this.photo_num= props.location.state.photo_num
        this.rating =  props.location.state.rating
        this.rating_num =  props.location.state.rating_num
        this.title =  props.location.state.title
        this.video_num =  props.location.state.video_num
        this.detail = props.location.state.detail
        //console.log(props.location.state);
    }

    getActorUrl(name) {
        for(var item in actorInfo) {
            if(actorInfo[item]["name"]==name) {
                return actorInfo[item]["url"]
            }
        }
        return null
    }

    Comment() {
        var rating = []
        var time = []
        var comment_content = []
        for(var item in this.comment_text_list) {
            if (this.comment_text_list[item] != null)
                comment_content.push(this.comment_text_list[item])
            else
                comment_content.push("暂无")
        }

        for(var item in this.comment_time_list) {
            if (this.comment_time_list[item] != null)
                time.push(this.comment_time_list[item])
            else
                time.push("暂无")
        }

        for(var item in this.comment_rate_list) {
            if (this.comment_rate_list[item] != null)
                rating.push(this.comment_rate_list[item])
            else
                rating.push("暂无")
        }

        let re = comment_content.map(function (item, index) {
            return (
                <div className="comment">
                    <div className="comment_content">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{item}</div>
                    <div className="comment_info"> &nbsp;&nbsp;&nbsp;&nbsp;评分 ： {rating[index]} &nbsp; &nbsp;  评价时间 ： {time[index]}<hr/></div>
                </div>

            )
        })

        return re;
    }

    // 渲染函数
    render() {
        let testUrl =this.img;
        let decription = this.detail
        let title = this.title
        let otherTitle = this.other_title

        var category=""
        for(var item in this.categories) {
            category+=this.categories[item]+"/"
        }
        if(category.length>0)
            category=category.substring(0,category.length-1)
        else
            category="暂无"
        let location=this.location
        let date = this.date
        let length = this.length
        var director=[]
        if(this.directors==null)
            director.push(<p>暂无</p>)
        else{
            for(var item in this.directors) {
                if(item==0)
                    director.push(<a href={this.getActorUrl(this.directors[item])} target="director_info">{this.directors[item]}</a>)
                else
                    director.push(<a href={this.getActorUrl(this.directors[item])} target="director_info">/{this.directors[item]}</a>)
            }
            if(director.length==0)
                director.push(<p>暂无</p>)
        }

        var actor=[]
        if(this.actors==null)
            actor.push(<p>暂无</p>)
        else{
            for(var item in this.actors) {
                if(this.actors[item]=="")
                    continue
                if(item==0)
                    actor.push(<a href={this.getActorUrl(this.actors[item])} target="actor_info">{this.actors[item]}</a>)
                else
                    actor.push(<a href={this.getActorUrl(this.actors[item])} target="actor_info">/{this.actors[item]}</a>)
            }
            if(actor.length==0)
                actor.push(<p>暂无</p>)
        }

        let rating = this.rating


        // 解决演员遍历循环
        var arr = [<strong>1</strong>];
        arr[1] = <strong>2</strong>;
        arr[2] = <strong>3</strong>;

        return (
            <div>
                <BreadcrumbCustom paths={['首页']}/>
                <div className='mindex'>
                    <Row gutter={16}>
                        <Col md={24}>
                            {/*链接到电影详情页*/}
                            <Card
                                style={{marginBottom: 24, marginLeft: 6, marginRight: 6}}
                                bodyStyle={{padding: 0}}>
                                <div className='_moviepost' >
                                    {new Img(testUrl).render()}
                                    {/*<img src={testUrl} className="_movieimg" alt=""/>*/}
                                </div>
                                <div className='info'>
                                    <div className='title'><strong>{title} </strong></div>
                                    <div className='other_title'><strong>别名: </strong> {otherTitle}</div>
                                    <div className='detail_info'><strong>分类: </strong> {category}</div>
                                    <div className='detail_info'><strong>上映地点: </strong> {location}</div>
                                    <div className='detail_info'><strong>上映时间: </strong> {date}年</div>
                                    <div className='detail_info'><strong>时长: </strong> {length}分钟</div>
                                    <div className='detail_info'><strong>导演: </strong> {director}</div>
                                    <div className='detail_info'><strong>主演: </strong> {actor}</div>
                                    <div className='detail_info'><strong>评分: </strong> {rating} <div><Rate disabled defaultValue={Math.round(rating)/2} allowHalf /></div></div>
                                </div>

                                <div className='pro'>
                                    <Row gutter={8}>
                                        <h3>热度排行</h3>
                                        <Col span={12}>
                                            <div>相关视频数</div>
                                            <Progress type="dashboard" percent={this.video_num} width={150} id='pro1'/>
                                        </Col>
                                        <Col span={12}>
                                            <div>相关图片数</div>
                                            <Progress type="dashboard" percent={this.photo_num} width={150} id='pro2'/>
                                        </Col>
                                    </Row>
                                    <Row gutter={8}>
                                        <Col span={12}>
                                            <div>评论数</div>
                                            <Progress type="dashboard" percent={this.rating_num} width={150} id='pro3'/>
                                        </Col>
                                        <Col span={12}>
                                            <div>相关新闻数</div>
                                            <Progress type="dashboard" percent={this.news_num} width={150} id='pro4'/>
                                        </Col>
                                    </Row>
                                </div>

                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col md={24}>
                            <Card
                                style={{marginBottom: 24, marginLeft: 6, marginRight: 6}}
                                bodyStyle={{padding: 0}}>
                                <div className="description_title">电影简介<hr/></div>

                                <div className="description">{decription}</div>
                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col md={24}>
                            <Card
                                style={{marginBottom: 24, marginLeft: 6, marginRight: 6}}
                                bodyStyle={{padding: 0}}>
                                <div className="description_title">相关评论<hr/></div>
                                {this.Comment()}
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

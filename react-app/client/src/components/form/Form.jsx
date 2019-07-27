import React, { Component } from 'react'
import './form.less';

import axios from 'axios';
import Mock from 'mockjs';
import moment from 'moment';
import {Row, Col, Input, Radio, Icon, Cascader, DatePicker, Button ,Card, Table} from 'antd';

import result from '../../default';

import address from './request/address.json';
import data from './request/data.json';

import BreadcrumbCustom from '../common/BreadcrumbCustom';
import './SearchPage.less';
const { Meta } = Card;


const Search = Input.Search;
const InputGroup = Input.Group;
const options = [];
const { RangePicker } = DatePicker;
Mock.mock('/address', address);
Mock.mock('/data', data);

var flag=true
var page

function defaultMovie(){
    var res=[]
    for(var item in result){
        var movie={}
        movie["title"]=result[item]["title"]
        movie["img"]=result[item]["img"]
        movie["rating"]=result[item]["rating"]
        movie["id"]=result[item]["id"]
        movie["actors"]=result[item]["actor"]
        res.push(movie)
    }
    return res
}


//数组中是否包含某项
function isContains(arr, item){
    arr.map(function (ar) {
        if(ar === item){
            return true;
        }
    });
    return false;
}
//找到对应元素的索引
function catchIndex(arr, key){ //获取INDEX
    arr.map(function (ar, index) {
        if(ar.key === key){
            return index;
        }
    });
    return 0;
}
//替换数组的对应项
function replace(arr, item, place){ //arr 数组,item 数组其中一项, place 替换项
    arr.map(function (ar) {
        if(ar.key === item){
            arr.splice(arr.indexOf(ar),1,place)
        }
    });
    return arr;
}

export class Img extends React.Component {
    url
    constructor(props) {
        super(props);
        this.state = {
            imageUrl: this.props
        };
        this.url = this.props
    }

    handleImageLoaded() {

    }

    handleImageErrored() {
        // document.getElementsByTagName("img")[3].src=require('../../default.png')
        document.getElementById(this.url).src=require('../../default.png')

    }

    render() {
        return (
            <img
                id={this.url}
                src={this.url}
                onLoad={this.handleImageLoaded.bind(this)}
                onError={this.handleImageErrored.bind(this)}
            />
        );
    }
}


export default class UForm extends Component{


    constructor(props) {
        super(props);

        this.btnSearch_Click = this.btnSearch_Click.bind(this);

        // 待测试 保留
        let localTemp = JSON.parse(localStorage.getItem('hotTemp'));
        // console.log(localTemp);
        if(localTemp === undefined || localTemp === null){
            this.state = {
                // userName: '',
                address: [],
                // timeRange: '',
                visible: false, //新建窗口隐藏
                bloading : true,  //按钮等待状态
                size : 'default',  //按钮尺寸

                input: "",
                searchType: '0',
                movieData: defaultMovie(),
                current: 1,

                Time:'0',
                Type:'0'
            };
        }else {
            console.log('is here!');
            this.state = {
                address: localTemp.address,
                visible: false, //新建窗口隐藏
                bloading: true,  //按钮等待状态
                size: 'default',  //按钮尺寸

                input: localTemp.input,
                searchType: '0',
                movieData: localTemp.movieData,
                current: localTemp.current,

                Time: localTemp.Time,
                Type: localTemp.Type
            };

            // console.log(this.state)
            localStorage.removeItem("hotTemp");
        }

        console.log(this.state);
    }

    movieIndex=[]
    columns = [{title:"",dataIndex:1,key:1},{title:"",dataIndex:2,key:2},{title:"",dataIndex:3,key:3},{title:"",dataIndex:4,key:4},{title:"",dataIndex:5,key:5}];
    movieName = []
    moviePic = []
    rating = []
    id=[]
    actor = []
    crt=1

    PrepareData() {
        var tempName=[];
        var tempUrl=[];
        var tempRating=[];
        var tempActor=[];
        var tempId=[];
        for(var item in this.state.movieData){
            //console.log(result[item]["title"])
            if(item%5==0){
                if(tempName.length>0){
                    this.movieName.push(tempName)
                    this.moviePic.push(tempUrl)
                    this.rating.push(tempRating)
                    this.actor.push(tempActor)
                    this.id.push(tempId)
                }
                tempName=[]
                tempUrl=[]
                tempRating=[]
                tempActor=[]
                tempId=[]
            }
            //console.log(this.state.movieData[item]["title"])
            tempName.push(this.state.movieData[item]["title"])
            tempUrl.push(this.state.movieData[item]["img"])
            tempRating.push(this.state.movieData[item]["rating"])
            tempId.push(this.state.movieData[item]["id"])
            var atr=""
            for(var a in this.state.movieData[item]["actors"]){
                //console.log(a)
                if((this.state.movieData[item]["actors"][a]==null)||(this.state.movieData[item]["actors"][a]==""))
                    continue
                atr+=this.state.movieData[item]["actors"][a]+","
            }
            //console.log(atr)
            if(atr.length>0)
                atr = atr.substring(0,atr.length-1)
            else
                atr="暂无"
            tempActor.push(atr)
            //console.log(tempName)
        }
        if(tempName.length>0){
            this.movieName.push(tempName)
            this.moviePic.push(tempUrl)
            //console.log(tempRating)
            this.rating.push(tempRating)
            this.actor.push(tempActor)
            this.id.push(tempId)
        }
        //console.log(this.rating)
    }

    PrepareIndex() {
        var tempIndex={1:""};
        for(var item in this.state.movieData){
            if(item%5==0){
                if(tempIndex[1]!=""){
                    this.movieIndex.push(tempIndex)
                }
                tempIndex={1:""}
            }
            tempIndex[item%5+1]=this.Result(item)
        }
        if(tempIndex[1]!=""){
            //console.log(tempIndex)
            this.movieIndex.push(tempIndex)
        }
    }

    RenderDefault() {
        return(
            {/*<img src={require('../../default.png')} alt="" />*/}
        )
    }

    Result(index) {

        let row=Math.floor(index/5);
        let col=index%5;
        return (
            <Col md={24}>
                {/*链接到电影详情页*/}
                <a onClick={()=>this.routerTo(this.id[row][col])} target="movie_window">
                    <Card
                        style={{marginBottom: 0, marginLeft: 0, marginRight: 0}}
                        bodyStyle={{padding: 0, height: '100%', width: '100%'}}>
                        <div className='moviepost'>
                            {/*<Image*/}
                            {/*    defaultSource={require('../../default.png')}*/}
                            {/*    source={{uri: this.moviePic[row][col]}}*/}
                            {/*    >*/}
                            {/*</Image>*/}
                            {/*<img src={this.moviePic[row][col]} alt="" onError={this.errorImg()} />*/}
                            {new Img(this.moviePic[row][col]).render()}
                            <h2>{this.movieName[row][col]}</h2>
                            <h3>{this.rating[row][col]}</h3>
                            <div className='actors'>
                                <div className='actors-name'><strong>主演: </strong> {this.actor[row][col]}</div>
                            </div>
                        </div>

                    </Card>
                </a>
            </Col>
        )
    }

    errorImg(){
        console.log("wrong!");

         // ="https://p0.meituan.net/movie/30b20139e68c46d02e0893277d633b701292458.jpg@464w_644h_1e_1c";

        // console.log(row);
        this.onerror=null;
    }


    makeLoading = ()=>{
        this.setState({bloading: true});
    }
    //取消按钮等待状态
    cancelLoading = ()=>{
        this.setState({bloading: false});
    }

    //改变按钮尺寸
    changeButtonSize = (e)=>{
        this.setState({size: e.target.value})

    }

    //getData
    getData = () => {
        axios.get('/data')
            .then(function (response) {
                // console.log(response.data);
                this.setState({
                    dataSource: response.data,
                    loading:false
                })
            }.bind(this))
            .catch(function (error) {
                console.log(error);
            })
    };
    //用户名输入
    onChangeUserName = (e) => {
        const value = e.target.value;
        this.setState({
            input: value,
        })
    };
    //用户名搜索
    onSearchUserName = (value) => {
        this.btnSearch_Click()
        // // console.log(value);
        // const { dataSource } = this.state;
        // this.setState({
        //     dataSource: dataSource.filter(item => item.name.indexOf(value) !== -1),
        //     loading: false,
        // })
    };
    //地址级联选择
    Cascader_Select = (value) => {
        const { dataSource } = this.state;
        if(value.length===0){
            this.setState({
                address: value,
                // dataSource: [],
            });
            this.getData();
        }else{
            this.setState({
                address: value,
                // dataSource: dataSource.filter(item => item.address === value.join(' / '))
            });
        }
    };

    // 电影时间过滤
    onChangeTime = (value) => {
        const timeValue = value;
        this.setState({
            Time: timeValue.target.value,
        });
    }

    // 电影类型过滤
    onChangeType = (value) => {
        const typeValue = value;
        this.setState({
            Type: typeValue.target.value,
        });
    }

    // 电影地址过滤
    onChangePlace = (value) => {
        const placeValue = value;

    }

    //时间选择
    RangePicker_Select = (date, dateString) => {
        // console.log(date, dateString);
        const { dataSource } = this.state;
        const startime = moment(dateString[0]);
        const endtime = moment(dateString[1]);
        if(date.length===0){
            this.setState({
                timeRange: date,
                dataSource: [],
            });
            this.getData();
        }else{
            this.setState({
                timeRange: date,
                dataSource: dataSource.filter(item => (moment(item.createtime.substring(0,10)) <= endtime  && moment(item.createtime.substring(0,10)) >= startime) === true)
            });
        }
    };
    //渲染
    componentDidMount(){
        if(options[0] == undefined){
            axios.get('/address')
                .then(function (response) {
                    response.data.map(function(province){
                        options.push({
                            value: province.name,
                            label: province.name
                        })
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
            this.getData();
        }
    }
    //搜索按钮
    async btnSearch_Click()  {

        let data = {'Time':this.state.Time, 'Type': this.state.Type, 'input':this.state.input, 'searchType': this.state.address};
        // console.log(data);
        let res = await axios.post('http://127.0.0.1:8000/movie_search/', data);
        // console.log(res);

        this.setState({
            movieData: res.data,
            current: 1
        })

        flag=false
        // console.log(this.state.movieData);
    };
    //重置按钮
    btnClear_Click = () => {
        this.setState({
            userName: '',
            address: '',
            timeRange: '',
            dataSource: [],
            count: data.length,
        });
        this.getData();
    };

    //取消
    handleCancel = () => {
        this.setState({ visible: false });
    };
    //批量删除
    MinusClick = () => {
        const { dataSource, selectedRowKeys } = this.state;
        this.setState({
            dataSource: dataSource.filter(item => !isContains(selectedRowKeys, item.key)),
        });
    };
    //单个删除
    onDelete = (key) => {
        const dataSource = [...this.state.dataSource];
        this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
    };
    //点击修改
    editClick = (key) => {
        const form = this.form;
        const { dataSource } = this.state;
        const index = catchIndex(dataSource, key);
        form.setFieldsValue({
            key: key,
            name: dataSource[index].name,
            sex: dataSource[index].sex,
            age: dataSource[index].age,
            address: dataSource[index].address.split(' / '),
            phone: dataSource[index].phone,
            email: dataSource[index].email,
            website: dataSource[index].website,
        });
        this.setState({
            visible: true,
            tableRowKey: key,
            isUpdate: true,
        });
    };
    //更新修改
    handleUpdate = () => {
        const form = this.form;
        const { dataSource, tableRowKey } = this.state;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            console.log('Received values of form: ', values);

            values.key = tableRowKey;
            values.address = values.address.join(" / ");
            values.createtime = moment().format("YYYY-MM-DD hh:mm:ss");

            form.resetFields();
            this.setState({
                visible: false,
                dataSource: replace(dataSource, tableRowKey, values)
            });
        });
    };
    //单选框改变选择
    checkChange = (selectedRowKeys) => {
        this.setState({selectedRowKeys: selectedRowKeys});
    };

    test(pageIndex, pageSize) {
        console.log(pageIndex)
        page=pageIndex
        //this.setState({ccrt:pageIndex})
        //this.renderTable(pageIndex)

        //this.state.ccrt=pageIndex
    }

    onChange = page => {
        console.log(page);
        this.setState({
            current: page,
        });
    }

    routerTo(id) {
        let data = {'id': id};

        // 待测试 保留
        localStorage.setItem("hotTemp", JSON.stringify(this.state));

        this.recPost(data);
        this.post(data);
    }

    // 发送后台推荐数据
    async recPost(data) {
        let res = await axios.post('http://127.0.0.1:8000/rec_movie/', data);

        let local = localStorage.getItem("recommend")

        let recData = {recMovie: res.data, index: 0};
        
        let wordRes = await axios.post('http://127.0.0.1:8000/words/', data);
        // 待测试推荐 保留
        localStorage.setItem("recommend", JSON.stringify(recData));
        localStorage.setItem("Words", JSON.stringify(wordRes.data));

        console.log(recData);
    }


    // 发送并查询后台数据
    async post(data) {

        let res = await axios.post('http://127.0.0.1:8000/movie_detail/', data);
        // console.log(res);
        
        let detailData = res.data;
        // console.log((detailData));
        // 发送详细数据到电影详情页
        this.props.history.push({pathname: `/app/movieDetail`, state: {
            actors: detailData['actors'], categories: detailData['categories'],
            comment_rate_list: detailData['comment_rate_list'],
            comment_text_list: detailData['comment_text_list'],
            comment_time_list: detailData['comment_time_list'],
            date: detailData['date'], directors: detailData['directors'],
            img: detailData['img'], length: detailData['length'],
            location: detailData['location'], news_num: detailData['news_num'],
            other_title: detailData['other_title'], photo_num: detailData['photo_num'],
            rating: detailData['rating'], rating_num: detailData['rating_num'],
            title: detailData['title'], video_num: detailData['video_num'], detail: detailData['detail']


        }})
        return res;
    }


    render(){
        const { userName, searchType, input, address } = this.state;
        const allow_type = false

        const questiontxt = ()=>{
            return (
                <p>
                    <Icon type="plus-circle-o" /> : 新建信息<br/>
                    <Icon type="minus-circle-o" /> : 批量删除
                </p>
            )
        };
        this.movieIndex=[]
        this.movieName = []
        this.moviePic = []
        this.rating = []
        this.id=[]
        this.actor = []
        this.PrepareData();
        this.PrepareIndex();

        return(
            <div>
                <BreadcrumbCustom paths={['首页','搜索电影']}/>
                <div className='formBody' style = {{ }}>
                    <Row gutter={16} className = 'A'>
                        <Col className="gutter-row" sm={3} >
                            <InputGroup compact>
                                <Cascader size="large" allowClear={allow_type} style={{ width: '100%'}} options={options} placeholder="选择搜索方式" onChange={this.Cascader_Select} value={address} />
                            </InputGroup>
                        </Col>
                        <Col className="gutter-row" sm={12}>
                            <Search style={{height:'1.2cm'}}
                                    placeholder="精确搜索电影/导演/艺人"
                                // prefix={<Icon type="user" />}
                                    value={input}
                                    onChange={this.onChangeUserName}
                                    onSearch={this.onSearchUserName}
                            />
                        </Col>
                        <Col className='btnOpera'>
                            <Button type="primary" className="bt" onClick={this.btnSearch_Click} style={{marginLeft:'10px', width:'3cm',height:'1.2cm'}}>查询</Button>
                        </Col>

                    </Row>

                    <Row>
                        <Radio.Group defaultValue={this.state.Time} buttonStyle="solid" className="rg" onChange={this.onChangeTime}>
                            <Radio.Button className="bt" value="0">全部年代</Radio.Button>
                            <Radio.Button className="bt" value="1">2011至今</Radio.Button>
                            <Radio.Button className="bt" value="2">2000至2010</Radio.Button>
                            <Radio.Button className="bt" value="3">90年代</Radio.Button>
                            <Radio.Button className="bt" value="4">80年代</Radio.Button>
                            <Radio.Button className="bt" value="5">70年代</Radio.Button>
                            <Radio.Button className="bt" value="6">更早</Radio.Button>
                        </Radio.Group>
                    </Row>
                    <Row>
                        <Radio.Group defaultValue={this.state.Type} buttonStyle="solid" className="rg" onChange={this.onChangeType}>
                            <Radio.Button className="bt" value="0">全部类型</Radio.Button>
                            <Radio.Button className="bt" value="1">喜剧</Radio.Button>
                            <Radio.Button className="bt" value="2">恐怖</Radio.Button>
                            <Radio.Button className="bt" value="3">动作</Radio.Button>
                            <Radio.Button className="bt" value="4">剧情</Radio.Button>
                            <Radio.Button className="bt" value="5">家庭</Radio.Button>
                            <Radio.Button className="bt" value="6">科幻</Radio.Button>
                        </Radio.Group>
                    </Row>
                    {/*<Row>*/}
                    {/*    <Radio.Group defaultValue="a" buttonStyle="solid" className="rg">*/}
                    {/*        <Radio.Button className="bt" value="0">全部地区</Radio.Button>*/}
                    {/*        <Radio.Button className="bt" value="1">美国</Radio.Button>*/}
                    {/*        <Radio.Button className="bt" value="2">欧洲</Radio.Button>*/}
                    {/*        <Radio.Button className="bt" value="3">中国大陆</Radio.Button>*/}
                    {/*        <Radio.Button className="bt" value="4">日韩</Radio.Button>*/}
                    {/*        <Radio.Button className="bt" value="5">印度</Radio.Button>*/}
                    {/*        <Radio.Button className="bt" value="6">泰国</Radio.Button>*/}
                    {/*    </Radio.Group>*/}
                    {/*</Row>*/}
                    <div>
                        <BreadcrumbCustom paths={['首页']}/>
                        <div className='mindex'>
                            <Row gutter={16}>
                                <Table pagination={{pageSize:2, onChange:this.onChange, current:this.state.current}} dataSource={this.movieIndex} columns={this.columns} showHeader={false}/>
                            </Row>
                        </div>
                    </div>
                </div>
            </div>

        )
    }
}
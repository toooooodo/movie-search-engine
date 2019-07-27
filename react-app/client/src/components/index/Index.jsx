import React, { Component } from 'react'; 
import BreadcrumbCustom from '../common/BreadcrumbCustom';
import { Card, Avatar, Row, Col, Progress, Timeline, Collapse, Table, Icon } from 'antd';
import zysoft from '../../style/img/avatar.jpg';
import './index.less';
import CountUp from 'react-countup';
import ReactEcharts from 'echarts-for-react';
const { Meta } = Card;
var dataWords

export default class MIndex extends Component {
    CountUp(){
        let imgSrc = ["mail","chat","cart","heart"];
        let imgName = ["Mails","Dialogue","Carts","Collection"];
        let count = ["1379","768","192","413"];
        let cu = imgSrc.map(function(item,index){
            return(
                <Col md={6} key={item}>
                    <Card style={{cursor:'pointer', marginBottom:16}}
                          actions={[<Icon type="info-circle-o" />, <Icon type="ellipsis" />]}>
                        <Meta
                            style={{fontSize:22}}
                            avatar={<img src={require('../../style/img/'+item+'.png')} alt=""/>}
                            title={imgName[index]}
                            description={<CountUp start={0} end={count[index]} duration={2.75}/>}
                        />
                    </Card>
                </Col>
            )
        });
        return cu;
    }
    getOption = () => {
        const option = {
            title: {
                text: '我的搜索关键词',
                // link: 'https://www.baidu.com/s?wd=' + encodeURIComponent('ECharts'),
                x: 'center',
                textStyle: {
                    fontSize: 32
                }

            },
            backgroundColor: '#FFFFFF',
            tooltip: {
                show: true
            },
            toolbox: {
                feature: {
                    saveAsImage: {
                        iconStyle: {
                            normal: {
                                color: '#FFFFFF'
                            }
                        }
                    }
                }
            },
            series: [{
                name: '我的搜索关键词',
                type: 'wordCloud',
                //size: ['9%', '99%'],
                sizeRange: [6, 66],
                //textRotation: [0, 45, 90, -45],
                rotationRange: [-45, 90],
                //shape: 'circle',
                textPadding: 0,
                autoSize: {
                    enable: true,
                    minSize: 6
                },
                textStyle: {
                    normal: {
                        color: function() {
                            return 'rgb(' + [
                                Math.round(Math.random() * 160),
                                Math.round(Math.random() * 160),
                                Math.round(Math.random() * 160)
                            ].join(',') + ')';
                        }
                    },
                    emphasis: {
                        shadowBlur: 10,
                        shadowColor: '#333'
                    }
                },
                data: dataWords
            }]
        };
        return option;
    };
    onChartClick = (params) => {



        window.open(params.data.url);
            // encodeURIComponent(params.data.url)
    };

    render() {
        const onEvents = {
            'click': this.onChartClick,
        };
        dataWords = JSON.parse(localStorage.getItem("Words"))
        if ((dataWords === undefined) || (dataWords === null))
            dataWords=[{"name":"暂无数据","value":100}]
        return (
            <div>
                <BreadcrumbCustom paths={['个人中心']}/>
                <div className='mindex'>
                    {/*<Row gutter={16}>*/}
                    {/*    {this.CountUp()}*/}
                    {/*</Row>*/}
                    <Row gutter={16}>
                        <Col md={16}>
                            <Card
                                style={{marginBottom:16}}
                                bodyStyle={{padding: 0,height:'500px',overflow:'hidden'}}>
                                <div>
                                    <ReactEcharts
                                        option={this.getOption()}
                                        style={{height: '500px', width: '100%', marginTop:'20px'}}
                                        onEvents={onEvents}
                                    />
                                </div>
                            </Card>
                        </Col>
                        <Col md={8}>
                            <Card
                                style={{marginBottom:16}}
                                bodyStyle={{padding: 0}}>
                                <div className='avatar'>
                                    <Avatar
                                        shape='circle'
                                        src={zysoft}
                                        style={{width: '60px', height: '60px', borderRadius: '50%', marginBottom:16}}
                                    />
                                    <div>admin</div>
                                    <div>admin@zju.com</div>
                                </div>
                                <div className='weather'>
                                    {/*心知天气API*/}
                                    <div className='weather-img'>
                                        <img src={require('../../style/img/0.png')} alt=""/>
                                    </div>
                                    <div className='weather-info'>
                                        <span>杭州</span>&nbsp;<span>36℃</span>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}
   
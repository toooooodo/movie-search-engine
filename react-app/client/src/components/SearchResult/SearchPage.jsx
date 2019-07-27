import React, { Component } from 'react';
import BreadcrumbCustom from '../common/BreadcrumbCustom';
import { Card, Avatar, Row, Col, Collapse, Table, Icon } from 'antd';
import './SearchPage.less';
const { Meta } = Card;

export default class MIndex extends Component {
    //显示搜索结果的函数
    movieName1 = [{key:"1",1:this.Result(1), 2:this.Result(2), 3:this.Result(3), 4:this.Result(4), 5:this.Result(5)},{key:"2",1:this.Result(6), 2:this.Result(7), 3:this.Result(8)}];
    columns = [{title:"",dataIndex:1,key:1},{title:"",dataIndex:2,key:2},{title:"",dataIndex:3,key:3},{title:"",dataIndex:4,key:4},{title:"",dataIndex:5,key:5}]
    Result(index) {
        let movieName = ["肖申克的救赎1", "肖申克的救赎2", "肖申克的救赎3", "肖申克的救赎4", "肖申克的救赎5", "肖申克的救赎6", "肖申克的救赎7", "肖申克的救赎8"];

        let testUrl = ["http://pic6.iqiyipic.com/image/20190517/c6/23/a_100259719_m_601_m10_180_236.jpg",
                        "http://img5.mtime.cn/mg/2019/03/19/143052.24055526_270X405X4.jpg",
                        "https://p0.meituan.net/movie/c0bec212d759ad52f22bbb280e551c065000875.jpg@464w_644h_1e_1c",
            "http://img5.mtime.cn/mg/2019/03/19/143052.24055526_270X405X4.jpg",
            "http://img5.mtime.cn/mg/2019/03/19/143052.24055526_270X405X4.jpg",
            "http://img5.mtime.cn/mg/2019/03/19/143052.24055526_270X405X4.jpg",
            "http://img5.mtime.cn/mg/2019/03/19/143052.24055526_270X405X4.jpg",
            "http://img5.mtime.cn/mg/2019/03/19/143052.24055526_270X405X4.jpg",
            "http://img5.mtime.cn/mg/2019/03/19/143052.24055526_270X405X4.jpg"]
        let testUrl_2 = "http://img5.mtime.cn/mg/2019/03/19/143052.24055526_270X405X4.jpg";
        let testUrl_3 = "https://p0.meituan.net/movie/c0bec212d759ad52f22bbb280e551c065000875.jpg@464w_644h_1e_1c";


        // let re = movieName.map(function (item, index) {
        //     return (
        //         <Col md={6}>
        //             {/*链接到电影详情页*/}
        //             <a href='#' target="movie_window">
        //                 <Card
        //                     style={{marginBottom: 24, marginLeft: 6, marginRight: 6}}
        //                     bodyStyle={{padding: 0}}>
        //                     <div className='moviepost'>
        //                         <img src={testUrl} alt=""/>
        //                         <h2>{item}</h2>
        //                         <h3>"7.5分"</h3>
        //                         <div className='actors'>
        //                             <div className='actors-name'><strong>主演: </strong> 大幅度发斯蒂芬斯蒂芬水电费水电费{item}</div>
        //                         </div>
        //                     </div>
        //
        //                 </Card>
        //             </a>
        //         </Col>
        //     )
        // });
        //
        // return re;
        let item=movieName[index];
        return (
                <Col md={26}>
                    {/*链接到电影详情页*/}
                    <a href='#' target="movie_window">
                        <Card
                            style={{marginBottom: 24, marginLeft: 6, marginRight: 6}}
                            bodyStyle={{padding: 0, height: 550}}>
                            <div className='moviepost'>
                                <img src={testUrl[index]} alt=""/>
                                <h2>{item}</h2>
                                <h3>"7.5分"</h3>
                                <div className='actors'>
                                    <div className='actors-name'><strong>主演: </strong> 大幅度发斯蒂芬斯蒂芬水电费水电费{item}</div>
                                </div>
                            </div>

                        </Card>
                    </a>
                </Col>
            )
    }

    // 渲染函数
    render() {
        return (
            <div>
                <BreadcrumbCustom paths={['首页']}/>
                <div className='mindex'>
                    <Row gutter={16}>
                        <Table pagination={true} dataSource={this.movieName1} columns={this.columns} showHeader={false}/>
                    </Row>
                </div>
            </div>
        )
    }
}

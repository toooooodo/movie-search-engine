import React, { PureComponent, lazy, Suspense } from 'react';
import { Avatar , Card, Input} from 'antd';
import moment from 'moment';
import style from './qa.css';
import axios from 'axios';
const { Search } = Input;



// 渲染不同内容的组件
const LazyComponent = lazy(() => import('./RenderContent'));

export default class index extends PureComponent {

    constructor(props){
        super(props);

        this.btnSearch_Click = this.btnSearch_Click.bind(this);

        var timestamp = (new Date()).valueOf();
        let curTime = moment(timestamp).format("YYYY-MM-DD HH:mm:ss");

        this.state = {
            loading: true,
            length: 1,
            list: [
                {
                    time: curTime,
                    avatar:
                        'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1563170991597&di=ccb70f8b145a9189d3d675e9518d1f4e&imgtype=0&src=http%3A%2F%2Fpic.51yuansu.com%2Fpic3%2Fcover%2F03%2F08%2F38%2F5b3f30f9e6cbc_610.jpg',
                    nickname: '电影问答机器人',
                    pos: 1,
                    text: '你好！有什么与电影有关的问题都可以问我！',
                }
            ]
        };
    }


    static getDerivedStateFromProps(nextProps, prevState) {
        const { data } = nextProps;
        if (!data || !Array.isArray(data) || data.length <= 0) {
            return null;
        }
        return {
            list: data,
        };
    }

    // 唤醒子组件的回调过程
    wakeUpLazyComponent = () => {
        return <div>loading.....</div>;
    };

    //上传按钮
    async btnSearch_Click(value)  {
        // 获取当前时间
        var timestamp = (new Date()).valueOf();
        let curTime = moment(timestamp).format("YYYY-MM-DD HH:mm:ss");

        let data = {'question':value};

        let tmpLength = this.state.length;
        var tmpList = this.state.list;

        tmpList[tmpLength] = {
            time: curTime,
            avatar:
                'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1563172428109&di=cebd6321438bd18b50032b01313bf1e6&imgtype=0&src=http%3A%2F%2Fhbimg.b0.upaiyun.com%2F9662a766b2e14418b22ed6e8185913c3e7562ab455df-j8mU0R_fw658',
            nickname: '用户',
            pos: 2,
            text: value,
        };

        this.setState({
            loading: true,
            length: tmpLength + 1,
            list: tmpList
        });


        // // console.log(data);
        let res = await axios.post('http://127.0.0.1:8000/answer/', data);

        timestamp = (new Date()).valueOf();
        let newTime = moment(timestamp).format("YYYY-MM-DD HH:mm:ss");

        let newLength = this.state.length;
        tmpList = this.state.list;

        tmpList[newLength] = {
            time: newTime,
            avatar:
                'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1563170991597&di=ccb70f8b145a9189d3d675e9518d1f4e&imgtype=0&src=http%3A%2F%2Fpic.51yuansu.com%2Fpic3%2Fcover%2F03%2F08%2F38%2F5b3f30f9e6cbc_610.jpg',
            nickname: '电影问答机器人',
            pos: 1,
            text: res.data['answer'],
        }

        this.setState({
            loading: true,
            length: newLength + 1,
            list: tmpList
        });

        value = "";
    };

    render() {
        const { list, loading } = this.state;
        const isRender = list && list.length > 0;
        return (
            <Card className = "card">
            <ul className="list-wrapper">
                {isRender &&
                list.map((item, listIndex) => {
                    return (
                        <Suspense fallback={this.wakeUpLazyComponent()} key={listIndex}>
                            <Card>
                            <li className="list-item">
                                <span className="time">{item.time ? item.time : '时间占位符'}</span>
                                <div
                                    className={
                                        item.pos === 1
                                            ? "list-item-horizontal"
                                            : "list-item-horizontal-reverse"
                                    }
                                >
                                    <Avatar
                                        shape="square"
                                        src={
                                            item.avatar
                                                ? item.avatar
                                                : 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
                                        }
                                        size="large"
                                    />
                                    <div
                                        className={
                                            item.pos === 1 ? "content-wrapper-flex" : "content-wrapper"
                                        }
                                    >
                                        <p className={item.pos === 1 ? "nickname" : "nickname-right"}>
                                            {item.nickname ? item.nickname : '用户昵称占位符'}
                                        </p>
                                        <div className="content">
                                            <LazyComponent {...item} />
                                        </div>
                                    </div>
                                </div>
                            </li>

                            </Card>

                        </Suspense>
                    );
                })}
            </ul>
                <div>
                    <Search
                        placeholder="input your questions"
                        enterButton="Send"
                        size="large"
                        onSearch={value => this.btnSearch_Click(value)}
                    />
                </div>
            </Card>
        );
    }
}
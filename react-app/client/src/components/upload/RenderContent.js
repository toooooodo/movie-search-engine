import React, { memo } from 'react';
import style from './qa.css';

// antd 图文组件
import { Card } from 'antd';
const { Meta } = Card;

const RenderContent = memo(props => {
    if (props.img && props.text) {
        return (
            <Card
                hoverable
                style={{ width: 300 }}
                cover={<img alt="example" src={props.img ? props.img : ''} />}
            >
                <Meta description={props.text ? props.text : ''} />
            </Card>
        );
    }
    if (props.img) {
        return (
            <div className="img-wrapper">
                <img className="img-preview" src={props.img ? props.img : ''} alt="photos" />
            </div>
        );
    }
    if (props.text) {
        return <div className="bubble">{props.text}</div>;
    }
    if (props.voice) {
        return <audio src={props.voice ? props.voice : ''} controls />;
    }
    return null;
});

export default RenderContent;

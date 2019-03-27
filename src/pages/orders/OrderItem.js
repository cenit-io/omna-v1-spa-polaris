import { Badge, TextStyle, Tooltip, ResourceList } from '@shopify/polaris';
import React from 'react';
import './OrdersList.css';

export function OrderItem (props){

    const element =
        <ResourceList.Item id={props.item.number} onClick={props.onClick}>
                <div className="row-item">
                    <div className="main-item">
                        <div>
                            <Tooltip content='Number'>
                                <TextStyle variation="strong">{props.item.number}</TextStyle>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="secondary-items">
                        <div style={{'minWidth': '150px'}}>
                            <Tooltip content='State'>
                                <Badge status={props.item.state === 'complete' ? 'success':'default'}>
                                    {props.item.state}
                                </Badge>
                            </Tooltip>
                        </div>
                        <div style={{'minWidth': '150px'}}>
                            <Tooltip content='Channel'>
                                <TextStyle>{props.item.channel}</TextStyle>
                            </Tooltip>
                        </div>
                        <div style={{'minWidth': '160px'}}>
                            <Tooltip content="Total">
                                <TextStyle>{props.item.total}{'$'}</TextStyle>
                            </Tooltip>
                        </div>
                    </div>
                </div>
        </ResourceList.Item>;


    return element;
}
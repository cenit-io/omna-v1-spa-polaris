import React from 'react';
import {Badge, TextStyle, Tooltip, ResourceList} from '@shopify/polaris';
import {OMNAComponent} from "../../common/OMNAComponent";
import {ResourceItemContext} from "../../common/ResourceItemContext";
import {Utils} from '../../common/Utils';

export class OrderItem extends OMNAComponent {
    constructor(props) {
        super(props);

        this.item = null;

        this.handleItemClick = this.handleItemClick.bind(this);
    }

    handleItemClick(itemId) {
        let item = Utils.orderItems.items.find((item) => item.number === itemId);

        OMNA.render('print-order', { number: item.number });
    }

    renderItem(itemContext) {
        this.item = itemContext.item;

        return (
            <ResourceList.Item id={this.item.number} onClick={this.handleItemClick}>
                <div className="row-item">
                    <div className="main-item">
                        <div>
                            <Tooltip content='Number'>
                                <TextStyle variation="strong">{this.item.number}</TextStyle>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="secondary-items">
                        <div style={{ 'minWidth': '150px' }}>
                            <Tooltip content='State'>
                                <Badge status={this.item.state === 'complete' ? 'success' : 'default'}>
                                    {this.item.state}
                                </Badge>
                            </Tooltip>
                        </div>
                        <div style={{ 'minWidth': '150px' }}>
                            <Tooltip content='Channel'>
                                <TextStyle>{this.item.channel}</TextStyle>
                            </Tooltip>
                        </div>
                        <div style={{ 'minWidth': '160px' }}>
                            <Tooltip content="Total">
                                <TextStyle>${this.item.total}</TextStyle>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </ResourceList.Item>
        )
    }

    renderWithAppContext(appContext) {
        return <ResourceItemContext.Consumer>{(itemContext) => this.renderItem(itemContext)}</ResourceItemContext.Consumer>
    }
}
import React from 'react';
import { Badge, ResourceList } from '@shopify/polaris';
import { OMNAComponent } from '../../common/OMNAComponent';
import { ResourceItemContext } from '../../common/ResourceItemContext';
import { Utils } from '../../common/Utils';

export class OrderItem extends OMNAComponent {
    constructor(props) {
        super(props);

        this.item = null;

        this.handleItemClick = this.handleItemClick.bind(this);
    }

    handleItemClick(itemId) {
        let item = Utils.orderItems.items.find((item) => item.number === itemId);
        OMNA.render('order', { order: item });
    }

    renderItem(itemContext) {
        let { number, shopify_state, channel_state, channel, total } = this.item = itemContext.item;

        return (
            <ResourceList.Item id={number} onClick={this.handleItemClick}>
                <div className="order-row item">
                    <div className="col number">{number}</div>
                    <div className="col state">
                        {shopify_state? <Badge status={Utils.status(shopify_state)} progress={Utils.progress(shopify_state)}>{shopify_state}</Badge>: ''}
                    </div>
                    <div className="col state">
                        {channel_state}
                    </div>
                    <div className="col channel">{channel}</div>
                    <div className="col total">${total}</div>
                </div>
            </ResourceList.Item>
        )
    }

    renderWithAppContext(appContext) {
        return <ResourceItemContext.Consumer>{(itemContext) => this.renderItem(itemContext)}</ResourceItemContext.Consumer>
    }
}
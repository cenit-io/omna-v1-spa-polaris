import React from 'react';
import {Badge, ResourceList} from '@shopify/polaris';
import {OMNAComponent} from '../../common/OMNAComponent';
import {ResourceItemContext} from '../../common/ResourceItemContext';
import {Utils} from '../../common/Utils';

export class OrderItem extends OMNAComponent {
    constructor(props) {
        super(props);
        this.item = null;
    }

    handleItemClick = (itemId) => {
        Utils.renderPage('order', { order: Utils.orderItems.items.find((item) => item.number === itemId) });
    };

    parseDate(str) {
        if (!str) return;

        try {
            return moment(str).format('Y-MM-DD H:mm:ss')
        } catch ( e ) {
            return str
        }
    }

    renderItem(itemContext) {
        let { number, shopify_state, channel_state, channel, total, completed_at } = this.item = itemContext.item;

        return (
            <ResourceList.Item id={number} onClick={this.handleItemClick}>
                <div className="order-row item">
                    <div className="col number">{number}</div>
                    <div className="col state">
                        {shopify_state ? <Badge status={Utils.status(shopify_state)}
                                                progress={Utils.progress(shopify_state)}>{shopify_state}</Badge> : ''}
                    </div>
                    <div className="col state">
                        {channel_state}
                    </div>
                    <div className="col channel">{channel}</div>
                    <div className="col total">${total}</div>
                    <div className="col date">{this.parseDate(completed_at)}</div>
                </div>
            </ResourceList.Item>
        )
    }

    renderWithAppContext(appContext) {
        return <ResourceItemContext.Consumer>{(itemContext) => this.renderItem(itemContext)}</ResourceItemContext.Consumer>
    }
}
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

    status(state) {
        switch ( state ) {
            case 'complete':
                return 'success';
            case 'pending':
                return 'info';
            case 'canceled':
                return 'attention';
            default:
                return 'default'
        }
    }

    progress(state) {
        switch ( state ) {
            case 'complete':
                return 'complete';
            case 'canceled':
                return 'incomplete';
            default:
                return 'partiallyComplete'
        }
    }

    handleItemClick(itemId) {
        let item = Utils.orderItems.items.find((item) => item.number === itemId);

        OMNA.render('print-order', { number: item.number });
    }

    renderItem(itemContext) {
        let { number, state, channel, total } = this.item = itemContext.item;

        return (
            <ResourceList.Item id={number} onClick={this.handleItemClick}>
                <div className="order-row item">
                    <div className="col number">{number}</div>
                    <div className="col state">
                        <Badge status={this.status(state)} progress={this.progress(state)}>{state}</Badge>
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
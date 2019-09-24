import React from 'react';
import {FilterType, Button} from '@shopify/polaris';
import {CaretDownMinor as descIcon, CaretUpMinor as ascIcon} from '@shopify/polaris-icons';
import {AbstractList} from "../AbstractList";
import {OrderItem} from './OrderItem';
import {ResourceItemContext} from "../../common/ResourceItemContext";
import {Utils} from '../../common/Utils';

import './OrdersList.css';

export class OrdersList extends AbstractList {
    constructor(props) {
        super(props);

        this.state.title = 'Orders';
        this.state.sort = 'channel ASC';
    }

    get resourceName() {
        return { singular: 'order', plural: 'orders' }
    }

    get resourceUrl() {
        return this.urlTo('orders')
    }

    get cache() {
        return Utils.orderItems
    }

    set cache(value) {
        Utils.orderItems = value
    }

    get filters() {
        let filters = [{
            key: 'channel',
            label: 'Channel',
            operatorText: [
                { key: 'is_channel', optionLabel: 'is' },
                { key: 'is_not_channel', optionLabel: 'is not' }
            ],
            type: FilterType.Select,
            options: this.activeChannels.map((ac) => {
                return { key: ac.name, value: ac.name, label: this.channelName(ac, false, true) }
            }),
        }];

        return filters
    }

    sortBy(field) {
        let sort = (this.state.sort || '_ ASC').split(' ');

        sort[0] = field;
        sort[1] = sort[1] === 'ASC' ? 'DESC' : 'ASC';

        super.sortBy(sort.join(' '))
    }

    idForItem(item) {
        return item.number
    }

    sortIcon(field) {
        let sort = (this.state.sort || '_ ASC').split(' ');

        if ( field === sort[0] ) return sort[1] === 'ASC' ? ascIcon : descIcon;
    }

    renterAlternateTool() {
        return (
            <div className="order-row header">
                <div className="col number">
                    <Button fullWidth outline size="slim" icon={this.sortIcon('number')}
                            onClick={() => this.sortBy('number')}>Number</Button>
                </div>
                <div className="col state">
                    <Button fullWidth outline size="slim" icon={this.sortIcon('state')}>
                        Shopify State</Button>
                </div>
                <div className="col state">
                    <Button fullWidth outline size="slim" icon={this.sortIcon('state')}>
                        Channel State</Button>
                </div>
                <div className="col channel">
                    <Button fullWidth outline size="slim" icon={this.sortIcon('channel')}
                            onClick={() => this.sortBy('channel')}>Channel</Button>
                </div>
                <div className="col total">
                    <Button fullWidth outline size="slim" icon={this.sortIcon('total')}
                            onClick={() => this.sortBy('total')}>Total</Button>
                </div>
                <div className="col date">
                    <Button fullWidth outline size="slim" icon={this.sortIcon('completed_at')}
                            onClick={() => this.sortBy('completed_at')}>Completed at</Button>
                </div>
            </div>
        )
    }

    renderItem(item) {
        return <ResourceItemContext.Provider value={{ item: item }}><OrderItem/></ResourceItemContext.Provider>
    }

    componentDidUpdate() {
        $('.Polaris-ResourceList__ResourceListWrapper').addClass('with-column-headers')
    }

    renderNotifications() {
        return super.renderNotifications('Order', 'Shopify', '-');
    }
}
import React from 'react';
import {FilterType} from '@shopify/polaris';
import {AbstractList} from "../AbstractList";
import {OrderItem} from './OrderItem';
import {ResourceItemContext} from "../../common/ResourceItemContext";
import {Utils} from '../../common/Utils';

import './OrdersList.css';

export class OrdersList extends AbstractList {
    constructor(props) {
        super(props);

        this.state.title = 'Orders';
        this.state.sortValue = 'channel ASC';
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
            key: 'sales_channels',
            label: 'Sales channels',
            operatorText: [
                { key: 'with_channel', optionLabel: 'include' },
                { key: 'without_channel', optionLabel: 'exnclude' }
            ],
            type: FilterType.Select,
            options: this.activeChannels.map((ac) => {
                return { key: ac.name, value: ac.name, label: this.channelName(ac, false, true) }
            }),
        }];

        return filters
    }

    get sortOptions() {
        return [
            { label: 'Channel A–Z', value: 'channel ASC' },
            { label: 'Channel Z–A', value: 'channel DESC' }
        ]
    }

    get channelsFiltersToParams() {
        let channelsFilters = [];

        this.appliedFilters.forEach((f) => {
            if ( f.key.match(/^with(out)?_channel$/) ) {
                let channel = this.activeChannels.find((channel) => {
                    return f.value === this.channelName(channel, false, true)
                });
                channelsFilters.push({ key: f.key, value: f.value, channel: channel.name });
            }
        });

        return channelsFilters
    }

    idForItem(item) {
        return item.number
    }

    renderItem(item) {
        return <ResourceItemContext.Provider value={{ item: item }}><OrderItem/></ResourceItemContext.Provider>
    }
}
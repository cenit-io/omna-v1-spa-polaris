import React from 'react';
import {ProductStores} from './ProductStores'
import {ProductLazada} from './ProductLazada'

export class ProductLazadaStores extends ProductStores {
    get tabs() {
        let salesChannels = this.productItems.items[this.props.productIndex].sales_channels || [],
            legacy = salesChannels.find((sc) => sc.channel === 'Lazada'),
            tabs = [];

        this.activeChannels.forEach((channel) => {
            const name = channel.name;

            if ( name.match(/^Lazada[A-Z]{2}$/) || (legacy && name === 'Lazada') ) {
                tabs.push({
                    id: 'product-' + name + '-tab',
                    content: this.channelName(channel, true),
                    channel: name,
                })
            }
        });

        return tabs
    }

    renderProductStore() {
        return <ProductLazada productIndex={this.props.productIndex}/>
    }
}
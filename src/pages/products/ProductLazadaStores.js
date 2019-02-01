import React from 'react';
import {ProductStores} from './ProductStores'
import {ProductLazada} from './ProductLazada'

export class ProductLazadaStores extends ProductStores {
    get tabs() {
        let salesChannels = this.productItems.items[this.props.productIndex].sales_channels || [],
            legacy = salesChannels.find((sc) => sc.channel === 'Lazada'),
            tabs = [];

        this.channelNames.forEach((channel) => {
            if ( channel.match(/^Lazada[A-Z]{2}$/) || (legacy && channel === 'Lazada') ) {
                tabs.push({
                    id: 'product-' + channel + '-tab',
                    content: channel === 'Lazada' ? 'Legacy' : channel,
                    channel: channel,
                })
            }
        });

        return tabs
    }

    renderProductStore() {
        return <ProductLazada productIndex={this.props.productIndex}/>
    }
}
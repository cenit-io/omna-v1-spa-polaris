import React from 'react';
import {ProductStores} from './ProductStores'
import {ProductLazada} from './ProductLazada'

export class ProductLazadaStores extends ProductStores {
    get tabs() {
        let product = this.productItems.items[this.props.productIndex],
            tabs = [],
            legacy = product.sales_channels.find((sc) => sc.channel === 'Lazada');

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
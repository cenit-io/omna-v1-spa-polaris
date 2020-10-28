import React from 'react';
import { ProductStores } from './ProductStores'
import { ProductShopee } from './ProductShopee'
import { Utils } from "../../common/Utils";

export class ProductShopeeStores extends ProductStores {
  get tabs() {
    let salesChannels = Utils.productItems.items[this.props.productIndex].sales_channels || [],
      legacy = salesChannels.find((sc) => sc.channel === 'Shopee'),
      tabs = [];

    this.activeChannels.forEach((channel) => {
      const name = channel.name;

      if (name.match(/^Shopee[A-Z]{2}$/) || (legacy && name === 'Shopee')) {
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
    return <ProductShopee productIndex={this.props.productIndex} />
  }
}
import React from 'react';
import {Link} from '@shopify/polaris';
import {TabsPage} from "../TabsPage";
import {StoreContext} from "../../common/StoreContext";
import {ProductQoo10} from './ProductQoo10'
import {ProductLazadaStores} from './ProductLazadaStores'
import {ProductShopee} from './ProductShopee'
import {ProductGeneral} from './ProductGeneral'
import {Utils} from "../../common/Utils";

export class ProductDetails extends TabsPage {
    constructor(props) {
        super(props);

        this.state.title = 'Product details';
        this.state.subTitle = Utils.productItems.items[props.productIndex].title;
    }

    productStoreComponent(name, pIdx) {
        if ( name.match(/^Qoo10/) ) return <ProductQoo10 productIndex={pIdx} store={name}/>;
        if ( name.match(/^Lazada/) ) return <ProductLazadaStores productIndex={pIdx} store={name}/>;
        if ( name.match(/^Shopee/) ) return <ProductShopee productIndex={pIdx} store={name}/>;
    }


    isAvailableChannel(name) {
        return this.activeChannels.find((channel) => channel.name.match(name))
    }

    get tabs() {
        let pIdx = this.props.productIndex,
            tabs = [{
                id: 'product-general-tab',
                content: 'General',
                body: <ProductGeneral productIndex={pIdx}/>
            }];

        ['Lazada', 'Shopee', 'Qoo10'].forEach((channel) => {
            this.isAvailableChannel(channel) && tabs.push({
                id: 'product-' + channel + '-tab',
                content: channel,
                body: (
                    <StoreContext.Provider value={channel}>
                        {this.productStoreComponent(channel, pIdx)}
                    </StoreContext.Provider>
                )
            })
        });

        if ( tabs.length === 1 ) {
            this.state.notifications.push({ status: 'warning', message: this.renderNotConfigured() })
        }

        return tabs;
    }

    renderNotConfigured() {
        return (
            <p>
                {'You have not configured any sales channel yet. You can configure them in the '}
                <Link onClick={() => OMNA.render('setup', { selectedTabIndex: 1 })}><b>setup</b></Link>
                {' section.'}
            </p>
        )
    }
}
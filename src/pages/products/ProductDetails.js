import React from 'react';
import {Link} from '@shopify/polaris';
import {TabsPage} from "../TabsPage";
import {ProductQoo10} from './ProductQoo10'
import {ProductLazada} from './ProductLazada'
import {ProductShopee} from './ProductShopee'
import {ProductGeneral} from './ProductGeneral'

export class ProductDetails extends TabsPage {
    constructor(props) {
        super(props);

        this.state.title = 'Product details';
        this.state.subTitle = this.productItems.items[props.productIndex].title;
    }

    productStoreComponent(name, pIdx) {
        if ( name.match(/^Qoo10/) ) return <ProductQoo10 productIndex={pIdx} store={name}/>;
        if ( name.match(/^Lazada/) ) return <ProductLazada productIndex={pIdx} store={name}/>;
        if ( name.match(/^Shopee/) ) return <ProductShopee productIndex={pIdx} store={name}/>;
    }

    get tabs() {
        let pIdx = this.props.productIndex,
            tabs = [{
                id: 'product-general-tab',
                content: 'General',
                body: <ProductGeneral productIndex={pIdx}/>
            }];

        this.channelNames.forEach((name) => {
            tabs.push({
                id: 'product-' + name + '-tab',
                content: this.channelName(name),
                body: this.productStoreComponent(name, pIdx)
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
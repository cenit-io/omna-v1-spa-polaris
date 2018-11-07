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

    tabs() {
        const
            { appContext } = this.state,
            { productIndex } = this.props,

            tabs = [{
                id: 'product-general-tab',
                content: 'General',
                body: <ProductGeneral productIndex={productIndex}/>
            }];

        if ( appContext.settings.lazada_connected ) tabs.push({
            id: 'product-lazada-tab',
            content: 'Lazada',
            body: <ProductLazada productIndex={productIndex}/>
        });

        if ( appContext.settings.qoo10_connected ) tabs.push({
            id: 'product-qoo10-tab',
            content: 'Qoo10',
            body: <ProductQoo10 productIndex={productIndex}/>
        });

        if ( appContext.settings.shopee_connected ) tabs.push({
            id: 'product-shopee-tab',
            content: 'Shopee',
            body: <ProductShopee productIndex={productIndex}/>
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
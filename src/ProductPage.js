import React from 'react';
import {Link} from '@shopify/polaris';
import {TabsPage} from './Commons';
import {ProductGeneral} from './ProductGeneral'
import {ProductLazada} from './ProductLazada'
import {ProductQoo10} from './ProductQoo10'

export class ProductPage extends TabsPage {
    constructor(props) {
        super(props);
        this.state.title = 'Product details';
        this.state.product = props.product;
        this.state.subTitle = props.product.title;
    }

    setProduct(product) {
        const idx = this.props.products.findIndex((idx, item) => item.product_id == product.product_id);

        this.props.products[idx] = product;
        this.setState({ product: product });
    }

    tabs() {
        const
            { product } = this.state,
            settings = this.getValue('OMNA.settings'),
            tabs = [{
                id: 'product-general-tab',
                content: 'General',
                body: <ProductGeneral parent={this} product={product}/>
            }];

        if ( settings.lazada_connected ) tabs.push({
            id: 'product-lazada-tab',
            content: 'Lazada',
            body: <ProductLazada parent={this} product={product}/>
        });

        if ( settings.qoo10_connected ) tabs.push({
            id: 'product-qoo10-tab',
            content: 'Qoo10',
            body: <ProductQoo10 parent={this} product={product}/>
        });

        if ( tabs.length == 1 ) {
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
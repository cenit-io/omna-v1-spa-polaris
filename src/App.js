import React, {Component} from 'react'
import {AppProvider} from '@shopify/polaris'
import {HomePage} from './pages/home/HomePage'
import {SetupPage} from './pages/setups/SetupPage'
import {PrintOrder} from './pages/print-order/PrintOrder'
import {ProductsList} from './pages/products/ProductsList'
import {ProductDetails} from './pages/products/ProductDetails'
import {AppContext} from './common/AppContext'

export class App extends Component {
    render() {
        const { appSettings, isLocal } = this.props;
        const context = { settings: appSettings };

        return (
            <AppProvider apiKey={isLocal ? null : appSettings.api_key}
                         shopOrigin={'https://' + appSettings.shop_domain}
                         forceRedirect={true}>
                <AppContext.Provider value={context}>{this.renderPage()}</AppContext.Provider>
            </AppProvider>
        )
    }

    renderPage() {
        let { page, data } = this.props;

        data = data || {};

        switch ( page ) {
            case 'home':
                return <HomePage/>;
            case 'setup':
                return <SetupPage selectedTabIndex={data.selectedTabIndex || 0}/>;
            case 'products':
                return <ProductsList/>;
            case 'print-order':
                return <PrintOrder/>;
            case 'product':
                return <ProductDetails product={data.product} products={data.products}
                                       productIndex={data.productIndex}/>;
        }
    }
}
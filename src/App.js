import React, {Component} from 'react'
import {AppProvider} from '@shopify/polaris'
import {HomePage} from './pages/home/HomePage'
import {SetupPage} from './pages/setups/SetupPage'
import {PrintOrder} from './pages/orders/PrintOrder'
import {ProductsList} from './pages/products/ProductsList'
import {ProductDetails} from './pages/products/ProductDetails'
import {AppContext} from './common/AppContext'
import {OrdersList} from "./pages/orders/OrdersList";

export class App extends Component {
    render() {
        const { appSettings, isLocal } = this.props;
        const apiKey = isLocal ? null : appSettings.api_key;

        return (
            <AppProvider apiKey={apiKey} shopOrigin={appSettings.shop_domain} forceRedirect={true}>
                <AppContext.Provider value={{ settings: appSettings }}>{this.renderPage()}</AppContext.Provider>
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
            case 'orders':
                return <OrdersList/>;
            case 'print-order':
                return <PrintOrder number={data.number}/>;
            case 'product':
                return <ProductDetails product={data.product} products={data.products}
                                       productIndex={data.productIndex}/>;
        }
    }
}
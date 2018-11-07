import React, {Component} from 'react';
import {AppProvider} from '@shopify/polaris';
import {HomePage} from './HomePage'
import {SetupPage} from './SetupPage'
import {ProductsPage} from './ProductsPage'
import {ProductPage} from './ProductPage'

export class App extends Component {
    render() {
        return (
            <AppProvider>{this.renderPage(this.props.page, this.props.data)}</AppProvider>
        )
    }

    renderPage(page, data) {
        data = data || {};

        switch ( page ) {
            case 'home':
                return (<HomePage/>);
            case 'setup':
                return (<SetupPage selectedTabIndex={data.selectedTabIndex || 0}/>);
            case 'products':
                return (<ProductsPage/>);
            case 'product':
                return (<ProductPage product={data.product} products={data.products}/>);
        }
    }
}
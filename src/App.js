import React, { Component } from 'react'
import { AppProvider } from '@shopify/polaris'
import { HomePage } from './pages/home/HomePage'
import { SetupPage } from './pages/setups/SetupPage'
import { PrintOrder } from './pages/orders/PrintOrder'
import { ProductsList } from './pages/products/ProductsList'
import { ProductDetails } from './pages/products/ProductDetails'
import { AppContext } from './common/AppContext'
import { Utils } from './common/Utils'
import { OrdersList } from './pages/orders/OrdersList';
import { OrderDetails } from './pages/orders/OrderDetails';

export class App extends Component {
  render() {
    let { appSettings } = this.props;

    return (
      <AppProvider shopOrigin={appSettings.shop_domain} forceRedirect={false}
                   apiKey={Utils.inIframe ? appSettings.api_key : null}>
        <AppContext.Provider value={{ settings: appSettings }}>{this.renderPage()}</AppContext.Provider>
      </AppProvider>
    )
  }

  renderPage() {
    let { page, data } = this.props;

    data = data || {};

    switch ( page ) {
      case 'home':
        return <HomePage />;
      case 'setup':
        return <SetupPage selectedTabIndex={data.selectedTabIndex || 0} />;
      case 'products':
        return <ProductsList />;
      case 'orders':
        return <OrdersList />;
      case 'print-order':
        return <PrintOrder number={data.number} />;
      case 'product':
        return <ProductDetails product={data.product} products={data.products}
                               productIndex={data.productIndex} />;
      case 'order':
        return <OrderDetails order={data.order} />;
    }
  }
}
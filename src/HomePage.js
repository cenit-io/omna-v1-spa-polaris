import React from 'react';
import {Page, Card, TextStyle, Banner, Subheading, FormLayout} from '@shopify/polaris';
import {OMNAPage} from './Commons';

export class HomePage extends OMNAPage {
    constructor(props) {
        super(props);
        this.state.shopDomain = '';
        this.state.shopDomainError = false;

        this.handleChangeshopDomain = this.handleChangeshopDomain.bind(this);
        this.handleInstall = this.handleInstall.bind(this);
    }

    handleChangeshopDomain(value) {
        this.setState({
            shopDomain: value,
            shopDomainError: value.match(/^([\wñáéíóú]+([\-\.][\wñáéíóú])?)+.+\.myshopify\.com$/i) ? false : 'Invalid store domain.'
        });
    }

    handleInstall() {
        open(window.location.href + '?shop=' + this.state.shopDomain, '_self')
    }

    render() {
        const
            productsHelpUrl = 'https://support.omna.io/hc/en-us/sections/360000597072-Products',
            orderssHelpUrl = 'https://support.omna.io/hc/en-us/sections/360000701831-Orders-Management',
            inventorysHelpUrl = 'https://support.omna.io/hc/en-us/articles/360014847471-How-to-manage-your-Lazada-Inventory-';

        return (
            <Page title={this.renderTitle()} separator={true}>

                {this.renderActions()}
                {this.renderInstall()}

                <Card sectioned title="Integrated Marketplace Connector">
                    <FormLayout.Group>
                        <Banner title={this.renderHelpLink('Products', productsHelpUrl)}>
                            <Subheading><TextStyle variation="subdued">Product Listing</TextStyle></Subheading>
                            <p>OMNA pushes your products to Lazada, Qoo10, Shopee & more</p>
                        </Banner>
                        <Banner title={this.renderHelpLink('Orders', orderssHelpUrl)}>
                            <Subheading><TextStyle variation="subdued">Order Management</TextStyle></Subheading>
                            <p>Manage all your orders within your Shopify dashboard</p>
                        </Banner>
                        <Banner title={this.renderHelpLink('Inventory', inventorysHelpUrl)}>
                            <p>Real-time inventory sync between Shopify & marketplaces</p>
                        </Banner>

                    </FormLayout.Group>
                </Card>
            </Page>
        );
    }
}
import React from 'react';
import {Card, TextStyle, Banner, Subheading, FormLayout, TextField, AccountConnection} from '@shopify/polaris';
import {OMNAPage} from "../OMNAPage";
import {Utils} from "../../common/Utils";

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

    renderInstall() {
        const { appContext, shopDomain, shopDomainError } = this.state;

        if ( appContext.settings.status === undefined ) {
            return (
                <AccountConnection
                    title="Install OMNA application in your Shopify store."
                    termsOfService={
                        <FormLayout>
                            <TextField label="Enter your store's domain:" value={shopDomain} error={shopDomainError}
                                       placeholder="my-store-name.myshopify.com"
                                       onChange={this.handleChangeshopDomain}/>
                        </FormLayout>
                    }
                    action={{
                        content: 'Install', onAction: this.handleInstall, disabled: shopDomain === '' || shopDomainError
                    }}
                />
            );
        }
    }

    renderPageContent() {
        const
            baseHelpUrl = 'https://omna.freshdesk.com/support/solutions/articles/',
            productsHelpUrl = '43000153252-adding-a-new-product-manually',
            orderssHelpUrl = '43000180832-managing-your-lazada-and-or-qoo10-orders',
            inventorysHelpUrl = '43000179146-managing-your-lazada-inventory';

        return (
            <div>
                {this.renderInstall()}

                <Card sectioned title="Integrated Marketplace Connector">
                    <FormLayout.Group>
                        <Banner icon="help" title={Utils.renderExternalLink('Products', baseHelpUrl + productsHelpUrl)}>
                            <Subheading><TextStyle variation="subdued">Product Listing</TextStyle></Subheading>
                            <p>OMNA pushes your products to Lazada, Qoo10, Shopee & more</p>
                        </Banner>
                        <Banner icon="help" title={Utils.renderExternalLink('Orders', baseHelpUrl + orderssHelpUrl)}>
                            <Subheading><TextStyle variation="subdued">Order Management</TextStyle></Subheading>
                            <p>Manage all your orders within your Shopify dashboard</p>
                        </Banner>
                        <Banner icon="help" title={Utils.renderExternalLink('Inventory', baseHelpUrl + inventorysHelpUrl)}>
                            <p>Real-time inventory sync between Shopify & marketplaces</p>
                        </Banner>
                    </FormLayout.Group>
                </Card>
            </div>
        );
    }
}
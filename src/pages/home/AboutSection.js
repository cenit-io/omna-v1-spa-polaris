import React from 'react';
import { Card, TextStyle, Banner, Subheading, FormLayout } from '@shopify/polaris';
import { Utils } from "../../common/Utils";
import { OMNAPageSection } from "../OMNAPageSection";

export class AboutSection extends OMNAPageSection {
  renderWithAppContext(appContext) {
    let baseHelpUrl = 'https://doc-api.omna.io/#/user-guide/',
      productsHelpUrl = 'prods',
      orderssHelpUrl = 'orders',
      inventorysHelpUrl = 'inventory';

    return (
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
          <Banner icon="help"
                  title={Utils.renderExternalLink('Inventory', baseHelpUrl + inventorysHelpUrl)}>
            <p>Real-time inventory sync between Shopify & marketplaces</p>
          </Banner>
        </FormLayout.Group>
      </Card>
    );
  }
}

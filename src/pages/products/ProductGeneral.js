import React from 'react';
import {Card, Thumbnail, Stack, FormLayout, TextField} from '@shopify/polaris';
import {ProductStore} from './ProductStore'
import {Utils} from "../../common/Utils";

export class ProductGeneral extends ProductStore {
    constructor(props) {
        super(props);
        this.state.store = 'Shopify';
    }

    renderImages() {
        const images = Utils.images(this.state.product);

        if ( images.length > 0 ) {
            const gallery = images.map((img, idx) => {
                return (<a className="lightbox" href={img.original} key={idx}><Thumbnail source={img.small}/></a>);
            });

            return (<div className="tz-gallery"><Stack>{gallery}</Stack></div>);
        } else {
            return Utils.warn('This product does not have images.');
        }
    }

    render() {
        const variant = this.state.product.variants[0];

        return (
            <div>
                <Card sectioned title="Details">
                    <FormLayout>
                        <FormLayout.Group>
                            <TextField type="text" disabled={true} value={variant.sku} label="SKU"/>
                            <TextField type="text" disabled={true} value={variant.barcode} label="Barcode"/>
                            <TextField type="text" disabled={true} value={'$' + variant.price} label="Price"/>
                        </FormLayout.Group>
                    </FormLayout>
                </Card>

                <Card sectioned title="Images">{this.renderImages()}</Card>
                <Card sectioned title="Variants">{this.renderVariants(false)}</Card>
            </div>
        )
    }

    componentDidMount() {
        baguetteBox.run('.tz-gallery')
    }
}
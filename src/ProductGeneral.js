import React from 'react';
import {Card, Thumbnail, Stack, FormLayout, TextField} from '@shopify/polaris';
import {ProductStore} from './ProductStore'

export class ProductGeneral extends ProductStore {
    constructor(props) {
        super(props);

        this.state.store = 'Shopify';

        this.renderImages = this.renderImages.bind(this);
    }

    renderImages() {
        const images = this.images(this.props.product);

        if ( images.length > 0 ) {
            const gallery = images.map(function (img, idx) {
                return (<a className="lightbox" href={img.original} key={idx}><Thumbnail source={img.small}/></a>);
            });

            return (<div className="tz-gallery"><Stack>{gallery}</Stack></div>);
        } else {
            return this.warn('This product does not have images.');
        }
    }

    renderOptionValues(sfyVariant) {
        const fields = sfyVariant.option_values.map(
            (ov, idx) => <TextField type="text" disabled={true} value={ov.value} label={ov.name} key={idx}/>
        );

        return <FormLayout.Group>{fields}</FormLayout.Group>
    }

    render() {
        const variant = this.defaultVariant(this.props.product);

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
                <Card sectioned title="Variants">{this.renderVariants()}</Card>
            </div>
        )
    }

    componentDidMount() {
        baguetteBox.run('.tz-gallery')
    }
}
import React from 'react';
import {FormLayout} from '@shopify/polaris';
import {ProductStore, CategorySelectBox, PropertyField} from './ProductStore'

export class ProductLazada extends ProductStore {
    constructor(props) {
        super(props);

        this.state.store = 'Lazada';
        this.state.storeDetails = null;
        this.state.canUpdateCategory = true;
        this.state.categoryAttribute = 'primary_category';

        this.handleCategoryChange = this.handleCategoryChange.bind(this);
    }

    handleCategoryChange(value) {
        this.setState((prevState) => {
            prevState.storeDetails.primary_category = value;

            // Clear previews attrs
            prevState.storeDetails.attributes = [];
            prevState.storeDetails.Skus && prevState.storeDetails.Skus.forEach((v) => v.attributes = []);
            prevState.propertiesDefinition = null;

            return prevState;
        });
    }

    canUpdateCategory(sPD) {
        return !sPD.primary_category
    }

    isNotValid() {
        const { storeDetails, propertiesDefinition } = this.state;

        var valid = true;

        propertiesDefinition.product.forEach(function (def) {
            const { value } = this.getProperty(def.name, storeDetails);
            valid = valid && (!def.required || (value !== undefined && value !== null && value !== ''));
        }.bind(this));

        valid && propertiesDefinition.variant.forEach(function (def) {
            valid && storeDetails.Skus.forEach(function (variant) {
                const { value } = this.getProperty(def.name, variant);
                valid = valid && (!def.required || (value !== undefined && value !== null && value !== ''));
            }.bind(this));
        }.bind(this));

        return !valid;
    }

    loadPropertiesDefinition() {
        const
            { storeDetails } = this.state,
            pds = this.getSessionItem('propertiesDefinitions', { lazada: {} }),
            pd = pds.lazada[storeDetails.primary_category];

        if ( pd ) {
            setTimeout(() => this.setState({ propertiesDefinition: pd, propertyError: false }), 100);
            console.log('Properties definition loaded from session store.');
        } else {
            const
                uri = this.urlTo('properties'),
                data = this.requestParams({ sch: 'Lazada', category_id: storeDetails.primary_category });

            $.getJSON(uri, data).done(function (response) {
                pds.lazada[storeDetails.primary_category] = response.properties;
                this.setSessionItem('propertiesDefinitions', pds);
                this.setState({ propertiesDefinition: response.properties, propertyError: false });
            }.bind(this)).fail(function (response) {
                const msg = 'Failed to load the properties for Lazada category. ' + response.responseJSON.error;

                this.flashError(msg);
                this.setState({ propertyError: msg });
            }.bind(this)).always(function () {
                this.loadingOff();
            }.bind(this));
        }
        return this.renderLoading();
    }

    renderPropertyField(prefixId, def, item) {
        const id = prefixId + '_' + (item.id || item.variant_id || item.product_id) + '_' + def.name;

        return <PropertyField id={id} definition={def} key={id}
                              property={this.getProperty(def.name, item)}
                              store={this.state.store}
                              onError={this.handleError}/>
    }

    renderProductProperties() {
        const { storeDetails, propertyError, propertiesDefinition } = this.state;

        if ( propertyError ) return this.error(propertyError);

        if ( !storeDetails.primary_category ) return this.warn(
            'The properties of this product can not be defined until product category has been defined.'
        );

        if ( !propertiesDefinition ) return this.loadPropertiesDefinition();

        if ( propertiesDefinition.product.length == 0 ) return this.info(
            'This product does not have specific properties in this sales channel.'
        );

        var l, r = /rich_text|multi_select/, groups = [];

        propertiesDefinition.product.forEach(function (pd) {
            l = groups.length;

            if ( l == 0 || pd.type.match(r) || groups[l - 1].length == 2 || groups[l - 1][0].type.match(r) ) {
                groups.push([pd]);
            } else {
                groups[l - 1].push(pd);
            }
        });

        return groups.map(
            (items, gIdx) => (
                <FormLayout.Group key={gIdx}>
                    {items.map((def, pIdx) => this.renderPropertyField('lp_' + gIdx + '_' + gIdx, def, storeDetails))}
                </FormLayout.Group>
            )
        );
    }

    renderOptionValues(sfyVariant) {
        const
            { storeDetails, propertyError, propertiesDefinition } = this.state,
            variant = storeDetails.Skus.find((v) => v.SellerSku == sfyVariant.sku);

        if ( propertyError ) return this.error(propertyError);

        if ( !storeDetails.primary_category ) return this.warn(
            'The option values of this variant can not be defined until product category has been defined.'
        );

        if ( !propertiesDefinition ) return this.renderLoading();

        if ( propertiesDefinition.variant.length == 0 ) return this.info(
            'This variant does not have specific option values in this sales channel.'
        );

        var l, r = /rich_text|multi_select/, groups = [];

        propertiesDefinition.variant.forEach(function (pd) {
            l = groups.length;

            if ( l == 0 || pd.type.match(r) || groups[l - 1].length == 3 || groups[l - 1][0].type.match(r) ) {
                groups.push([pd]);
            } else {
                groups[l - 1].push(pd);
            }
        });

        return groups.map(
            (items, gIdx) => (
                <FormLayout.Group key={gIdx}>
                    {items.map((def, pIdx) => this.renderPropertyField('lvp_' + gIdx + '_' + pIdx, def, variant))}
                </FormLayout.Group>
            )
        );
    }

    renderVariants() {
        if ( !this.state.storeDetails.primary_category ) {
            return this.warn('The variants of this product can not be defined until product category has been defined.');
        } else {
            return super.renderVariants(true);
        }
    }
}
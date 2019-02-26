import React from 'react';
import {ProductStore} from './ProductStore'

export class ProductLazada extends ProductStore {
    constructor(props) {
        super(props);

        this.state.categoryAttr = 'primary_category';
        this.state.variantsAttr = 'Skus';
    }

    get isNotValid() {
        let { storeDetails } = this.state,
            propertiesDefinition = this.propertiesDefinition;

        let valid = true;

        propertiesDefinition.product.forEach((def) => {
            const { value } = this.getPropertyContext(def, storeDetails);
            valid = valid && (!def.required || (value !== undefined && value !== null && value !== ''));
        });

        valid && propertiesDefinition.variant.forEach((def) => {
            valid && storeDetails.Skus.forEach((variant) => {
                const { value } = this.getPropertyContext(def, variant);
                valid = valid && (!def.required || (value !== undefined && value !== null && value !== ''));
            });
        });

        return !valid;
    }

    renderOptionValues(sfyVariant) {
        let
            { storeDetails, error } = this.state,
            propertiesDefinition = this.propertiesDefinition,
            variant = storeDetails.Skus.find((v) => v.SellerSku === sfyVariant.sku);

        if ( error ) return this.error(error);

        if ( !this.category ) return this.warn(
            'The option values of this variant can not be defined until product category has been defined.'
        );

        if ( !propertiesDefinition ) return this.renderLoading();

        if ( propertiesDefinition.variant.length === 0 ) return this.info(
            'This variant does not have specific option values in this sales channel.'
        );

        const groups = this.groupProperties(propertiesDefinition.variant);

        return groups.map((group, gIdx) => this.renderPropertiesGroup(group, 'v_' + gIdx, variant));
    }

    renderVariants(includeDefault) {
        if ( !this.category ) return this.warn(
            'The variants of this product can not be defined until product category has been defined.'
        );

        return super.renderVariants(includeDefault);
    }
}
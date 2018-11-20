import React from 'react';
import {ProductStore} from './ProductStore'
import {PropertyContext} from '../../common/PropertyContext'

export class ProductLazada extends ProductStore {
    constructor(props) {
        super(props);

        this.state.store = 'Lazada';
        this.state.categoryAttr = 'primary_category';
        this.state.variantsAttr = 'Skus';
    }

    get isNotValid() {
        const { storeDetails, propertiesDefinition } = this.state;

        var valid = true;

        propertiesDefinition.product.forEach((def) => {
            const { value } = this.getPropertyContext(def.name, storeDetails);
            valid = valid && (!def.required || (value !== undefined && value !== null && value !== ''));
        });

        valid && propertiesDefinition.variant.forEach((def) => {
            valid && storeDetails.Skus.forEach((variant) => {
                const { value } = this.getPropertyContext(def.name, variant);
                valid = valid && (!def.required || (value !== undefined && value !== null && value !== ''));
            });
        });

        return !valid;
    }

    renderStaticProperties() {
        return (
            <PropertyContext.Provider value={this.state.storeDetails}>
                {this.renderStaticPropertyDescription()}
            </PropertyContext.Provider>
        )
    }

    renderProperties() {
        const { error, propertiesDefinition } = this.state;

        if ( error ) return this.error(error);

        if ( !this.category ) return this.warn(
            'The properties of this product can not be defined until product category has been defined.'
        );

        if ( !propertiesDefinition ) return this.loadPropertiesDefinition();

        if ( propertiesDefinition.product.length === 0 ) return this.info(
            'This product does not have specific properties in this sales channel.'
        );

        let l, r = /rich_text|multi_select/, groups = [];

        propertiesDefinition.product.forEach((pd) => {
            l = groups.length;

            if ( l === 0 || pd.type.match(r) || groups[l - 1].length === 2 || groups[l - 1][0].type.match(r) ) {
                groups.push([pd]);
            } else {
                groups[l - 1].push(pd);
            }
        });

        return (
            <div>
                {this.renderStaticProperties()}
                {groups.map((group, gIdx) => this.renderPropertiesGroup(group, 'lp_' + gIdx))}
            </div>
        )
    }

    renderOptionValues(sfyVariant) {
        const
            { storeDetails, error, propertiesDefinition } = this.state,
            variant = storeDetails.Skus.find((v) => v.SellerSku === sfyVariant.sku);

        if ( error ) return this.error(error);

        if ( !this.category ) return this.warn(
            'The option values of this variant can not be defined until product category has been defined.'
        );

        if ( !propertiesDefinition ) return this.renderLoading();

        if ( propertiesDefinition.variant.length === 0 ) return this.info(
            'This variant does not have specific option values in this sales channel.'
        );

        let l, r = /rich_text|multi_select/, groups = [];

        propertiesDefinition.variant.forEach((pd) => {
            l = groups.length;

            if ( l === 0 || pd.type.match(r) || groups[l - 1].length === 3 || groups[l - 1][0].type.match(r) ) {
                groups.push([pd]);
            } else {
                groups[l - 1].push(pd);
            }
        });

        return groups.map((group, gIdx) => this.renderPropertiesGroup(group, 'lvp_' + gIdx, variant));
    }

    renderVariants(includeDefault) {
        if ( !this.category ) return this.warn(
            'The variants of this product can not be defined until product category has been defined.'
        );

        return super.renderVariants(includeDefault);
    }
}
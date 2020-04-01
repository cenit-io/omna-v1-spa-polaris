import React from 'react';
import {FormLayout, TextField} from '@shopify/polaris';
import {ProductStore} from './ProductStore'
import {Utils} from '../../common/Utils'

export class ProductLazada extends ProductStore {
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

    getSCHVariantData(sfyVariant) {
        let { storeDetails, error } = this.state,
            schVariant = storeDetails.Skus.find((v) => v.SellerSku === sfyVariant.sku);

        error = error || (schVariant ? error : 'Synchronization error...');

        return { schVariant, error }
    }

    renderReadOnlyAtts(sfyVariant) {
        let { schVariant, error } = this.getSCHVariantData(sfyVariant);

        if (error) return Utils.error(error);

        let special_price = schVariant.special_price || this.getPropertyContext({ name: 'special_price' }, sfyVariant).value;

        return (
            <FormLayout.Group>
                <TextField type="text" disabled={true} value={schVariant.SellerSku} label="SKU"/>
                <TextField type="text" disabled={true} value={'$' + schVariant.price} label="Price"/>
                <TextField type="text" disabled={true} value={'$' + special_price} label="Special price"/>
            </FormLayout.Group>
        )
    }

    renderOptionValues(sfyVariant) {
        let { schVariant, error } = this.getSCHVariantData(sfyVariant),
            propertiesDefinition = this.propertiesDefinition;

        if (error) return Utils.error(error);

        if (!this.category) return Utils.warn(
            'The option values of this variant can not be defined until product category has been defined.'
        );

        if (!propertiesDefinition) return Utils.renderLoading();

        if (propertiesDefinition.variant.length === 0) return Utils.info(
            'This variant does not have specific option values in this sales channel.'
        );

        const groups = Utils.groupProperties(propertiesDefinition.variant);

        return groups.map((group, gIdx) => {
            return Utils.renderPropertiesGroup(group, 'v_' + gIdx, schVariant, this.store, this.renderPropertyField)
        });
    }

    renderVariants(includeDefault) {
        if (!this.category) return Utils.warn(
            'The variants of this product can not be defined until product category has been defined.'
        );

        return super.renderVariants(includeDefault);
    }
}
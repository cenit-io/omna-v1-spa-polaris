import React from 'react';
import { Card, FormLayout, TextField } from '@shopify/polaris';
import { ProductStore } from './ProductStore'
import { PropertyField } from '../../common/PropertyField'
import { PropertyContext } from '../../common/PropertyContext'
import { Utils } from "../../common/Utils";

export class ProductShopee extends ProductStore {
  constructor(props) {
    super(props);
    this.state.descriptionRich = false;
  }

  get canUpdateCategory() {
    return true
  }

  getSCHVariantData(sfyVariant) {
    let { storeDetails, error } = this.state,
      schVariant = storeDetails.variations.find((v) => v.variation_sku === sfyVariant.sku);

    error = error || (schVariant ? error : 'Synchronization error...');

    return { schVariant, error }
  }

  getLogistic(logistic_id) {
    return this.storeSettings.logistics.find((l) => l.logistic_id === logistic_id);
  }

  renderReadOnlyAtts(sfyVariant) {
    let { schVariant, error } = this.getSCHVariantData(sfyVariant);
    console.log(schVariant);

    if (error) return Utils.error(error);

    return (
      <FormLayout.Group>
        <TextField type="text" disabled={true} value={schVariant.variation_sku} label="SKU" />
        <TextField type="text" disabled={true} value={'$' + schVariant.price} label="Inherited Price" />
        <PropertyContext.Provider value={schVariant}>
          {
            this.renderStaticPropertyField({
              type: 'numeric',
              name: 'custom_price',
              label: 'Custom Price',
              min: 0
            })
          }
        </PropertyContext.Provider>
      </FormLayout.Group>
    )
  }

  renderLogistic(item) {
    let prefixId = 'sp_logistic_' + item.logistic_id + '_',
      logistic = this.getLogistic(item.logistic_id),
      feeType = logistic ? logistic.fee_type : null;

    return (
      <PropertyContext.Provider value={item} key={prefixId}>
        <FormLayout.Group title={logistic.logistic_name}>
          <PropertyField id={prefixId + 'shipping_fee'} definition={{
            type: 'numeric',
            name: 'shipping_fee',
            label: 'Shipping fee',
            valueAttr: 'shipping_fee',
            required: feeType !== 'CUSTOM_PRICE'
          }} />
          {
            feeType === 'SIZE_SELECTION' &&
            <PropertyField id={prefixId + 'size_id'} definition={{
              type: 'single_select',
              name: 'size_id',
              label: 'Size',
              options: (logistic.sizes || []).map((s) => {
                return { key: s.size_id, value: s.size_id, label: s.name }
              }),
              required: feeType === 'SIZE_SELECTION'
            }} />
          }
          <PropertyField id={prefixId + 'bool_select'} definition={{
            type: 'bool_select',
            name: 'is_free',
            label: 'Is free',
            valueAttr: 'is_free',
          }} />
        </FormLayout.Group>
      </PropertyContext.Provider>
    )
  }

  renderLogistics() {
    const logistics = this.state.storeDetails.logistics;

    if (logistics && logistics.length !== 0) return (
      <Card sectioned title="Logistics">
        {logistics.map((item) => this.renderLogistic(item))}
      </Card>
    )
  }

  renderPackageDimensions() {
    const prefixId = 'sp_package_dimensions_package_';

    return (
      <PropertyContext.Provider value={this.state.storeDetails}>
        <Card sectioned title="Package dimensions (cm / kg)">
          <FormLayout.Group>
            <PropertyField id={prefixId + 'length'} definition={{
              type: 'numeric', name: 'package_length', label: 'Length', valueAttr: 'package_length'
            }} />
            <PropertyField id={prefixId + 'width'} definition={{
              type: 'numeric', name: 'package_width', label: 'Width', valueAttr: 'package_width'
            }} />
            <PropertyField id={prefixId + 'height'} definition={{
              type: 'numeric', name: 'package_height', label: 'Height', valueAttr: 'package_height'
            }} />
            <PropertyField id={prefixId + 'weight'} definition={{
              type: 'numeric', name: 'weight', label: 'Weight', valueAttr: 'weight'
            }} />
          </FormLayout.Group>
        </Card>
      </PropertyContext.Provider>
    )
  }

  renderStaticProperties() {
    return (
      <PropertyContext.Provider value={this.state.storeDetails}>
        {this.renderPropertyDescription()}
        {this.renderLogistics()}
        {this.renderPackageDimensions()}
      </PropertyContext.Provider>
    )
  }
}

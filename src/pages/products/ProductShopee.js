import React from 'react';
import {Card, FormLayout, Button, Stack} from '@shopify/polaris';
import {ProductStore} from './ProductStore'
import {PropertyField} from '../../common/PropertyField'
import {PropertyContext} from '../../common/PropertyContext'

export class ProductShopee extends ProductStore {
    constructor(props) {
        super(props);

        this.state.store = 'Shopee';
        this.state.categoryAttr = 'category_id';
        this.state.descriptionRich = false;

        this.handleBrand = this.handleBrand.bind(this);
        this.handleAddWholesale = this.handleAddWholesale.bind(this);
        this.handleDeleteWholesale = this.handleDeleteWholesale.bind(this);
    }

    handleBrand(value) {
        this.setState((prevState) => {
            prevState.storeDetails.BrandNo = value;
            return prevState;
        });
    }

    handleAddWholesale() {
        this.setState((prevState) => {
            prevState.storeDetails.wholesales.push({});

            return prevState;
        });
    }

    handleDeleteWholesale(item) {
        return () => this.setState((prevState) => {
            prevState.storeDetails.wholesales.splice(prevState.storeDetails.wholesales.indexOf(item), 1);

            return prevState;
        });
    }

    getLogistic(logistic_id) {
        return this.state.appContext.settings.shopee_logistics.find((l) => l.logistic_id == logistic_id);
    }

    renderLogistic(item) {
        const
            prefixId = 'sp_logistic_' + item.logistic_id + '_',
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
                        required: feeType != 'CUSTOM_PRICE'
                    }}/>
                    {
                        feeType === 'SIZE_SELECTION' &&
                        <PropertyField id={prefixId + 'size_id'} definition={{
                            type: 'single_select',
                            name: 'size_id',
                            label: 'Size',
                            valueAttr: 'size_id',
                            options: [], // TODO: Get options from logistic
                            required: feeType === 'SIZE_SELECTION'
                        }}/>
                    }
                    <PropertyField id={prefixId + 'bool_select'} definition={{
                        type: 'bool_select',
                        name: 'is_free',
                        label: 'Is free',
                        valueAttr: 'is_free',
                    }}/>
                </FormLayout.Group>
            </PropertyContext.Provider>
        )
    }

    renderLogistics() {
        const logistics = this.state.storeDetails.logistics;

        if ( logistics && logistics.length != 0 ) return (
            <Card sectioned title="Logistics">
                {logistics.map((item) => this.renderLogistic(item))}
            </Card>
        )
    }

    renderPackageDimensions() {
        const prefixId = 'sp_package_dimensions_package_';

        return (
            <PropertyContext.Provider value={this.state.storeDetails}>
                <Card sectioned title="Package dimensions (cm)">
                    <FormLayout.Group>
                        <PropertyField id={prefixId + 'length'} definition={{
                            type: 'numeric', name: 'package_length', label: 'Length', valueAttr: 'package_length'
                        }}/>
                        <PropertyField id={prefixId + 'width'} definition={{
                            type: 'numeric', name: 'package_width', label: 'Width', valueAttr: 'package_width'
                        }}/>
                        <PropertyField id={prefixId + 'height'} definition={{
                            type: 'numeric', name: 'package_height', label: 'Height', valueAttr: 'package_height'
                        }}/>
                    </FormLayout.Group>
                </Card>
            </PropertyContext.Provider>
        )
    }

    renderWholesale(item, idx, canRemove) {
        const prefixId = 'sp_wholesale_' + idx + '_';

        return (
            <PropertyContext.Provider value={item} key={prefixId}>
                <FormLayout.Group>
                    <Stack distribution="fill" wrap="false">
                        <PropertyField id={prefixId + 'min'} definition={{
                            type: 'numeric', name: 'min', label: 'Min Qty', valueAttr: 'min'
                        }}/>
                        <PropertyField id={prefixId + 'max'} definition={{
                            type: 'numeric', name: 'max', label: 'Max Qty', valueAttr: 'max'
                        }}/>
                        <PropertyField id={prefixId + 'unit_price'} definition={{
                            type: 'numeric', name: 'unit_price', label: 'Unit price', valueAttr: 'unit_price'
                        }}/>
                        <Stack distribution="trailing">
                            <Button destructive={true} icon="delete" disabled={!canRemove}
                                    onClick={this.handleDeleteWholesale(item)}/>
                        </Stack>
                    </Stack>
                </FormLayout.Group>
            </PropertyContext.Provider>
        )
    }

    renderWholesales() {
        const
            { storeDetails } = this.state,
            wholesales = storeDetails.wholesales = storeDetails.wholesales || [{}],
            canRemove = wholesales.length != 1;

        return (
            <Card sectioned title="Wholesales" primaryFooterAction={{
                content: 'Add', icon: 'add', onAction: this.handleAddWholesale
            }}>
                {wholesales.map((item, idx) => this.renderWholesale(item, idx, canRemove))}
            </Card>
        )
    }

    renderStaticProperties() {
        return (
            <PropertyContext.Provider value={this.state.storeDetails}>
                {this.renderPropertyDescription()}
                {this.renderLogistics()}
                {this.renderPackageDimensions()}
                {this.renderWholesales()}
            </PropertyContext.Provider>
        )
    }
}

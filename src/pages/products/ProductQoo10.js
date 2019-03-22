import React from 'react';
import {FormLayout, Card} from '@shopify/polaris';
import {ProductStore} from './ProductStore'
import {PropertyField} from '../../common/PropertyField'
import {NewPropertyDlg} from '../../common/NewPropertyDlg'
import {PropertyContext} from '../../common/PropertyContext'
import {Utils} from "../../common/Utils";

export class ProductQoo10 extends ProductStore {
    static get adult_item_options() {
        return [{ label: 'No', value: 'N' }, { label: 'Yes', value: 'Y' }];
    }

    static get production_place_options() {
        return ['Domestic - Singapore', 'Overseas', 'Others'];
    }

    static get industrial_code_type_options() {
        return [
            { label: 'JAN', value: 'JANCode' },
            { label: 'KAN', value: 'KANCode' },
            { label: 'ISBN', value: 'ISBN' },
            { label: 'UPC', value: 'UPCCode' },
            { label: 'EAN', value: 'EANCode' },
            { label: 'HS', value: 'HSCode' },
        ];
    }

    constructor(props) {
        super(props);

        this.state.resetAttrs = false;
        this.state.descriptionAttr = 'ItemDescription';

        this.handleBrand = this.handleBrand.bind(this);
        this.addNewProperty = this.addNewProperty.bind(this);
    }

    handleBrand(value) {
        this.setState((prevState) => {
            prevState.storeDetails.BrandNo = value;
            return prevState;
        });
    }

    get canUpdateCategory() {
        return true
    }

    addNewProperty(property) {
        const { storeDetails } = this.state;

        storeDetails.attributes = storeDetails.attributes || [];

        if ( storeDetails.attributes.find((a) => a.name === property.name) ) {
            this.flashError('Invalid property name, this already exists.');
            return false;
        }

        this.setState((prevState) => {
            prevState.storeDetails.attributes.push(property);
            return prevState;
        });

        return true;
    }

    renderPropertyField(prefixId, propertyContext) {
        const def = { type: 'text', label: propertyContext.label, name: propertyContext.name, valueAttr: 'value' };

        const id = prefixId + '_' + (this.state.storeDetails.ecommerce_id) + '_' + def.name;

        return (
            <PropertyContext.Provider value={propertyContext} key={id}>
                <PropertyField id={id} definition={def} store={this.store} disabled={this.isWaitingSync}/>
            </PropertyContext.Provider>
        )
    }

    renderStaticProperties() {
        return (
            <PropertyContext.Provider value={this.state.storeDetails}>
                {this.renderPropertyDescription()}
                <Card sectioned>
                    <FormLayout.Group>
                        {
                            this.renderStaticPropertyField({
                                type: 'brand', name: 'BrandNo', idAttr: 'brand_id', required: true
                            })
                        }
                        {
                            this.renderStaticPropertyField({
                                type: 'single_select',
                                name: 'IndustrialCodeType',
                                label: 'Industrial code type',
                                options: ProductQoo10.industrial_code_type_options,
                                required: true
                            })
                        }
                        {
                            this.renderStaticPropertyField({
                                type: 'single_select',
                                name: 'ProductionPlace',
                                label: 'Production place',
                                options: ProductQoo10.production_place_options,
                                required: true, tags: true
                            })
                        }
                    </FormLayout.Group>

                    <FormLayout.Group>
                        {
                            this.renderStaticPropertyField({
                                type: 'nomenclature_select_box',
                                name: 'ManufactureNo',
                                label: 'Manufacture',
                                idAttr: 'manufacturer_id',
                                entity: 'Manufacturer',
                                idAttr: 'manufacturer_id',
                                className: 'manufacture-select-box',
                                required: true
                            })
                        }
                        {
                            this.renderStaticPropertyField({
                                type: 'date', name: 'ManufactureDate', label: 'Manufacture date'
                            })
                        }
                        {
                            this.renderStaticPropertyField({ type: 'text', name: 'Material' })
                        }
                    </FormLayout.Group>

                    <FormLayout.Group>
                        {
                            this.renderStaticPropertyField({ type: 'text', name: 'ModelNm', label: 'Model number' })
                        }
                        {
                            this.renderStaticPropertyField({
                                type: 'date', name: 'AvailableDateValue', label: 'Available date'
                            })
                        }
                        {
                            this.renderStaticPropertyField({ type: 'date', name: 'ExpireDate', label: 'Expiry date' })
                        }
                    </FormLayout.Group>

                    <FormLayout.Group>
                        {
                            this.renderStaticPropertyField({
                                type: 'single_select',
                                name: 'AdultYN',
                                label: 'Adult item',
                                options: ProductQoo10.adult_item_options,
                                required: true
                            })
                        }
                        {
                            this.renderStaticPropertyField({ type: 'text', name: 'Gift' })
                        }
                        {
                            this.renderStaticPropertyField({
                                type: 'numeric',
                                name: 'DisplayLeftPeriod',
                                label: 'Available period left',
                                min: 1,
                                max: 3
                            })
                        }
                    </FormLayout.Group>

                    <FormLayout.Group>
                        {
                            this.renderStaticPropertyField({
                                type: 'text', name: 'ShippingNo', label: 'Shipping fee code', required: true
                            })
                        }
                        {
                            this.renderStaticPropertyField({
                                type: 'numeric',
                                name: 'DesiredShippingDate',
                                label: 'Desired shipping date',
                                min: 1,
                                max: 20
                            })
                        }
                        {
                            this.renderStaticPropertyField({ type: 'numeric', name: 'Weight (g)', min: 0 })
                        }
                    </FormLayout.Group>
                </Card>
            </PropertyContext.Provider>
        )
    }

    renderCategoryProperties() {
        // Override
    }

    renderCustomProperties() {
        let { storeDetails } = this.state;

        storeDetails.attributes = storeDetails.attributes || [];

        let groups = Utils.groupProperties(storeDetails.attributes),
            fields = groups.map((group, gIdx) => {
                return Utils.renderPropertiesGroup(group, gIdx, storeDetails, this.store, this.renderPropertyField)
            });

        return <Card sectioned>{fields}<NewPropertyDlg onAdd={this.addNewProperty}/></Card>;
    }
}

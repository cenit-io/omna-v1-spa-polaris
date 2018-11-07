import React from 'react';
import {FormLayout, Card, Stack, Button, TextField, Modal} from '@shopify/polaris';
import {ProductStore, CategorySelectBox, PropertyField} from './ProductStore'
import {OMNAComponent} from './Commons';

class NewPropertyDlg extends OMNAComponent {
    constructor(props) {
        super(props);
        this.state.active = false;
        this.state.property = { name: '', value: '' };

        this.handleOpen = this.handleOpen.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleOpen() {
        this.setState({ active: true, property: { name: '', value: '' } });
    }

    handleClose() {
        this.setState({ active: false });
    }

    handleAdd() {
        const { onAdd } = this.props;
        onAdd && onAdd(this.state.property) && this.handleClose();
    }

    handleChange(attr) {
        return (value) => this.setState((prevState) => {
            prevState.property[attr] = value;
            return prevState;
        });
    }

    isValid() {
        const { property } = this.state;

        property.name = property.name.trim();
        property.value = property.value.trim();

        return property.name != '' && property.value != '';
    }

    render() {
        const { active, property } = this.state;

        return (
            <div>
                <Stack distribution="trailing" wrap="false">
                    <Button onClick={this.handleOpen}>Add new property</Button>
                </Stack>
                <Modal
                    open={active} limitHeight={false}
                    onClose={this.handleClose.bind(this)}
                    title="New property:"
                    primaryAction={{ content: 'Add', onAction: this.handleAdd, disabled: !this.isValid() }}>
                    <Modal.Section>
                        <TextField type="text" value={property.name}
                                   label="Name" onChange={this.handleChange('name')} placeholder="New property name"/>
                        <TextField type="text" value={property.value}
                                   label="Value" onChange={this.handleChange('value')}
                                   placeholder="New property value"/>
                    </Modal.Section>
                </Modal>
            </div>
        )
    }
}

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

        this.state.store = 'Qoo10';
        this.state.storeDetails = null;
        this.state.canUpdateCategory = true;
        this.state.categoryAttribute = 'SecondSubCat';

        this.handleCategoryChange = this.handleCategoryChange.bind(this);
        this.handleBrand = this.handleBrand.bind(this);
        this.addProperty = this.addProperty.bind(this);
    }

    handleCategoryChange(value) {
        this.setState((prevState) => {
            prevState.storeDetails.SecondSubCat = value;
            return prevState;
        });
    }

    handleBrand(value) {
        this.setState((prevState) => {
            prevState.storeDetails.BrandNo = value;
            return prevState;
        });
    }

    addProperty(property) {
        const { storeDetails } = this.state;

        storeDetails.Attributes = storeDetails.Attributes || [];

        if ( storeDetails.Attributes.find((a) => a.name === property.name) ) {
            this.flashError('Invalid property name, this already exists.');
            return false;
        }

        this.setState((prevState) => {
            prevState.storeDetails.Attributes.push(property);
            return prevState;
        });

        return true;
    }

    renderPropertyField(prefixId, def, item) {
        if ( typeof def == 'function' ) return def.call(this, prefixId, item);

        var attr;

        if ( def.type ) {
            attr = item;
        } else {
            attr = def;
            def = { type: 'text', label: def.label, name: def.name, valueAttr: 'value' };
        }

        def.valueAttr = def.valueAttr || def.name;

        const id = prefixId + '_' + (item.product_id) + '_' + def.name;

        return <PropertyField id={id} definition={def} property={attr} store={this.state.store} key={id}/>
    }

    renderProductProperties() {
        const { storeDetails } = this.state;

        storeDetails.Attributes = storeDetails.Attributes || [];

        var l, groups = [
            [
                (prefixId, item) => this.renderPropertyField(prefixId, {
                    type: 'brand', name: 'BrandNo', idAttr: 'brand_id'
                }, item),

                (prefixId, item) => this.renderPropertyField(prefixId, {
                    type: 'single_select',
                    name: 'IndustrialCodeType',
                    label: 'Industrial code type',
                    options: ProductQoo10.industrial_code_type_options,
                    required: true
                }, item),

                (prefixId, item) => this.renderPropertyField(prefixId, {
                    type: 'single_select',
                    name: 'ProductionPlace',
                    label: 'Production place',
                    options: ProductQoo10.production_place_options,
                    required: true, tags: true
                }, item),
            ],
            [
                (prefixId, item) => this.renderPropertyField(prefixId, {
                    type: 'text', name: 'ManufactureNo', label: 'Manufacture number', required: true
                }, item),
                (prefixId, item) => this.renderPropertyField(prefixId, {
                    type: 'date', name: 'ManufactureDate', label: 'Manufacture date'
                }, item),
                (prefixId, item) => this.renderPropertyField(prefixId, {
                    type: 'text', name: 'Material'
                }, item),
            ],
            [
                (prefixId, item) => this.renderPropertyField(prefixId, {
                    type: 'text', name: 'ModelNm', label: 'Model number'
                }, item),
                (prefixId, item) => this.renderPropertyField(prefixId, {
                    type: 'date', name: 'AvailableDateValue', label: 'Available date'
                }, item),
                (prefixId, item) => this.renderPropertyField(prefixId, {
                    type: 'date', name: 'ExpireDate', label: 'Expiry date'
                }, item),
            ],
            [
                (prefixId, item) => this.renderPropertyField(prefixId, {
                    type: 'single_select',
                    name: 'AdultYN',
                    label: 'Adult item',
                    options: ProductQoo10.adult_item_options,
                    required: true
                }, item),
                (prefixId, item) => this.renderPropertyField(prefixId, {
                    type: 'text', name: 'Gift'
                }, item),
                (prefixId, item) => this.renderPropertyField(prefixId, {
                    type: 'numeric', name: 'DisplayLeftPeriod', label: 'Available period left', min: 1, max: 3
                }, item),
            ],
            [
                (prefixId, item) => this.renderPropertyField(prefixId, {
                    type: 'text', name: 'ShippingNo', label: 'Shipping fee code', required: true
                }, item),
                (prefixId, item) => this.renderPropertyField(prefixId, {
                    type: 'numeric', name: 'DesiredShippingDate', label: 'Desired shipping date', min: 1, max: 20
                }, item),
                (prefixId, item) => this.renderPropertyField(prefixId, {
                    type: 'numeric', name: 'Weight', min: 0
                }, item)
            ],
        ];

        storeDetails.Attributes.forEach(function (attr) {
            l = groups.length;

            if ( l == 0 || groups[l - 1].length == 3 ) {
                groups.push([attr]);
            } else {
                groups[l - 1].push(attr);
            }
        });

        return (
            <FormLayout>
                {
                    groups.map(
                        (items, idx) => (
                            <FormLayout.Group key={idx}>
                                {items.map((attr) => this.renderPropertyField('qp_' + idx, attr, storeDetails))}
                            </FormLayout.Group>
                        )
                    )
                }
                <NewPropertyDlg onAdd={this.addProperty}/>
            </FormLayout>
        );
    }
}

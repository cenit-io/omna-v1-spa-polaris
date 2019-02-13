import React from 'react';
import {FormLayout, Select, TextField, DescriptionList} from '@shopify/polaris';
import {SetupStore} from './SetupStore'
import {LocationSelectBox} from '../../common/LocationSelectBox'
import {NomenclatureSelectBox} from '../../common/NomenclatureSelectBox'
import logo from '../../images/shopee_logo.png';

export class SetupShopeeStore extends SetupStore {
    constructor(props) {
        super(props);

        this.state.store = 'Shopee';
        this.state.avatarUrl = logo;
    }

    get domainOptions() {
        return [
            { label: 'Singapore', value: 'api.shopee.sg' },
            { label: 'Malaysia', value: 'api.shopee.com.my' },
        ]
    }

    get storeSettings() {
        let storeSettings = super.storeSettings;

        storeSettings.domain = storeSettings.domain || this.domainOptions[0].value;

        return storeSettings
    }

    renderAccount() {
        return this.info('Account info:',
            <DescriptionList items={[
                { term: 'Domain:', description: this.storeSettings.domain.replace(/^api\./, '') }
            ]}/>
        );
    }

    renderDataConnectionForm() {
        const storeSettings = this.storeSettings;

        return (
            <FormLayout>
                <Select label="Domain" options={this.domainOptions} value={storeSettings.domain}
                        onChange={this.handleChange('domain')}/>
                <LocationSelectBox id="shopee-location-id" value={storeSettings.location_id}
                                   onChange={this.handleChange('location_id')}/>
            </FormLayout>
        )
    }

    renderDefaultProperties() {
        const defaultProperties = this.defaultProperties;

        if ( this.isConnected ) return (
            <FormLayout>
                <FormLayout.Group>
                    <TextField type="number" label="Days to ship" value={defaultProperties.days_to_ship}
                               onChange={this.handleChangeDefaultProperty('days_to_ship')}/>

                    <NomenclatureSelectBox id="default_properties_logistic" className="logistics-select-box"
                                           store="Shopee" entity="Logistic" label="Logistic"
                                           idAttr="logistic_id" textAttr="logistic_name"
                                           value={defaultProperties.logistic}
                                           onChange={this.handleChangeDefaultProperty('logistic')}/>
                </FormLayout.Group>
            </FormLayout>
        )
    }
}



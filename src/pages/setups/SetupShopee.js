import React from 'react';
import {FormLayout, Select, TextField, DescriptionList} from '@shopify/polaris';
import {SetupStore} from './SetupStore'
import {LocationSelectBox} from '../../common/LocationSelectBox'
import {NomenclatureSelectBox} from '../../common/NomenclatureSelectBox'
import logo from '../../images/shopee_logo.png';

export class SetupShopee extends SetupStore {
    constructor(props) {
        super(props);

        this.state.store = 'Shopee';
        this.state.avatarUrl = logo;
    }

    initStoreSettings(appContext) {
        if ( this.state.storeSettings === undefined ) {
            this.state.storeSettings = {
                shopee_domain: 'api.shopee.sg',
                shopee_location_id: '',
                shopee_default_properties: this.parseDefaultProperties(appContext),
            }
        }
    }

    renderAccount() {
        const storeSettings = this.state.storeSettings;

        return this.info('Account info:',
            <DescriptionList items={[
                { term: 'Domain:', description: storeSettings.shopee_domain.replace(/^api\./, '') }
            ]}/>
        );
    }

    renderDataConnectionForm() {
        const
            storeSettings = this.state.storeSettings,
            options = [
                { label: 'Singapore', value: 'api.shopee.sg' },
                { label: 'Malaysia', value: 'api.shopee.com.my' },
            ];

        return (
            <FormLayout>
                <Select label="Domain" options={options} value={storeSettings.shopee_domain}
                        onChange={this.handleChange('shopee_domain')}/>
                <LocationSelectBox id="shopee-location-id" value={storeSettings.shopee_location_id}
                                   onChange={this.handleChange('shopee_location_id')}/>
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

                    <NomenclatureSelectBox id="shopee_default_properties_logistic" className="logistics-select-box"
                                           store="Shopee" entity="Logistic" label="Logistic"
                                           idAttr="logistic_id" textAttr="logistic_name"
                                           value={defaultProperties.logistic}
                                           onChange={this.handleChangeDefaultProperty('logistic')}/>
                </FormLayout.Group>
            </FormLayout>
        )
    }
}



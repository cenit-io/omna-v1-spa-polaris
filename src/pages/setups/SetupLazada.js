import React from 'react';
import {FormLayout, Select, DescriptionList} from '@shopify/polaris';
import {SetupStore} from './SetupStore'
import {LocationSelectBox} from '../../common/LocationSelectBox'
import logo from '../../images/lazada_logo.png';

export class SetupLazada extends SetupStore {
    constructor(props) {
        super(props);

        this.state.store = 'Lazada';
        this.state.avatarUrl = logo;
    }

    get isValid() {
        return this.state.storeSettings.location_id != null
    }

    renderAccount() {
        const
            account = this.state.appContext.settings.channels['Lazada'].seller || {},
            storeSettings = this.state.storeSettings;

        return this.info('Seller account:',
            <DescriptionList items={[
                { term: 'Name:', description: account.name },
                { term: 'Company:', description: account.company },
                { term: 'Email:', description: account.email },
                { term: 'Domain:', description: storeSettings.domain.replace(/^api\./, '') }
            ]}/>
        );
    }

    renderDataConnectionForm() {
        const
            storeSettings = this.state.storeSettings,
            options = [
                { label: 'Singapore', value: 'api.lazada.sg' },
                { label: 'Malaysia', value: 'api.lazada.com.my' },
            ];

        return (
            <FormLayout>
                <Select label="Domain" options={options} value={storeSettings.domain}
                        onChange={this.handleChange('domain')}/>
                <LocationSelectBox id="lazada-location-id" value={storeSettings.location_id}
                                   onChange={this.handleChange('location_id')}/>
            </FormLayout>
        )
    }
}



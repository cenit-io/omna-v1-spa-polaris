import React from 'react';
import {FormLayout, Select, DescriptionList} from '@shopify/polaris';
import {SetupStore, LocationSelectBox} from './SetupStore'

export class SetupLazada extends SetupStore {
    constructor(props) {
        super(props);

        const { OMNA } = window;

        this.state.store = 'Lazada';
        this.state.connected = OMNA.settings.lazada_connected;
        this.state.account = OMNA.settings.lazada_seller;
        this.state.helpUri = 'https://support.omna.io/hc/en-us/articles/360008459051';
        this.state.avatarUrl = 'https://www.lazada.com/themes/lzd/favicon.png';
        this.state.settings = {
            lazada_domain: 'api.lazada.sg',
            lazada_location_id: '',
            lazada_default_properties: this.parseDefaultProperties(OMNA.settings.lazada_default_properties),
        }
    }

    renderAccount() {
        const { connected, account } = this.state;

        if ( connected ) {
            return this.info('Seller account:',
                <DescriptionList items={[
                    { term: 'Name:', description: account.name },
                    { term: 'Company:', description: account.company },
                    { term: 'Email:', description: account.email }
                ]}/>
            );
        }
    }

    renderModalContent() {
        const
            settings = this.state.settings,
            options = [
                { label: 'Singapore', value: 'api.lazada.sg' },
                { label: 'Malaysia', value: 'api.lazada.com.my' },
            ];

        return (
            <FormLayout>
                <Select label="Domain" options={options} value={settings.lazada_domain}
                        onChange={this.handleChange('lazada_domain')}/>
                <LocationSelectBox id="lazada-location-id" value={settings.lazada_location_id}
                                   onChange={this.handleChange('lazada_location_id')}/>
            </FormLayout>
        )
    }
}



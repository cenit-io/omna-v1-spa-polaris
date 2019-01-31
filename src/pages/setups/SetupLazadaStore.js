import React from 'react';
import {FormLayout, DescriptionList} from '@shopify/polaris';
import {SetupStore} from './SetupStore'
import {LocationSelectBox} from '../../common/LocationSelectBox'
import logo from '../../images/lazada_logo.png';

export class SetupLazadaStore extends SetupStore {
    constructor(props) {
        super(props);
        this.state.avatarUrl = logo;
    }

    get settings() {
        return this.props.parent.selectedTab
    }

    get store() {
        return this.settings.channel
    }

    get storeName() {
        return 'Lazada-' + this.settings.content
    }

    get isValid() {
        return this.state.storeSettings.location_id != null
    }

    renderAccount() {
        const account = this.state.storeSettings.seller;

        return this.info('Seller account:',
            <DescriptionList items={[
                { term: 'Name:', description: account.name },
                { term: 'Company:', description: account.company },
                { term: 'Email:', description: account.email }
            ]}/>
        );
    }

    renderDataConnectionForm() {
        return (
            <FormLayout>
                <LocationSelectBox id="lazada-location-id" value={this.state.storeSettings.location_id}
                                   onChange={this.handleChange('location_id')}/>
            </FormLayout>
        )
    }
}



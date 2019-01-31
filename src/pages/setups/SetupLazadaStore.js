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

    get tabSettings() {
        return this.props.parent.selectedTab
    }

    get store() {
        return this.tabSettings.channel
    }

    get storeName() {
        return 'Lazada-' + this.tabSettings.content
    }

    get isValid() {
        return this.state.storeSettings.location_id != null
    }

    renderAccount() {
        let account = this.state.storeSettings.seller,
            items = [
                { term: 'Name:', description: account.name },
                { term: 'Company:', description: account.company },
                { term: 'Email:', description: account.email },
                { term: 'Domain:', description: this.channel.domain }
            ];

        return this.info('Seller account:', <DescriptionList items={items}/>);
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



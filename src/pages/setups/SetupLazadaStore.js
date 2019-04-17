import React from 'react';
import {FormLayout, DescriptionList} from '@shopify/polaris';
import {SetupStore} from './SetupStore'
import {LocationSelectBox} from '../../common/LocationSelectBox'
import logo from '../../images/lazada_logo.png';
import {Utils} from "../../common/Utils";

export class SetupLazadaStore extends SetupStore {
    constructor(props) {
        super(props);
        this.state.avatarUrl = logo;
    }

    get isValid() {
        return this.storeSettings.location_id != null
    }

    renderAccount() {
        let account = this.storeSettings.seller,
            items = [
                { term: 'Name:', description: account.name },
                { term: 'Company:', description: account.company },
                { term: 'Email:', description: account.email },
                { term: 'Country:', description: this.props.country }
            ];

        return Utils.info('Seller account:', <DescriptionList items={items}/>);
    }

    renderDataConnectionForm() {
        return <LocationSelectBox id="lazada-location-id" value={this.storeSettings.location_id}
                                  disabled={this.isInactive}
                                  onChange={this.handleChange('location_id')}/>
    }

    componentDidUpdate(prevProps) {
        if ( prevProps.channel !== this.props.channel ) this.setState({ notificationsLoaded: false })
    }
}



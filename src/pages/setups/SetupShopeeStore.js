import React from 'react';
import {FormLayout, TextField, DescriptionList} from '@shopify/polaris';
import {SetupStore} from './SetupStore'
import {LocationSelectBox} from '../../common/LocationSelectBox'
import {NomenclatureSelectBox} from '../../common/NomenclatureSelectBox'
import logo from '../../images/shopee_logo.png';
import {Utils} from "../../common/Utils";

export class SetupShopeeStore extends SetupStore {
    constructor(props) {
        super(props);
        this.state.avatarUrl = logo;
    }

    renderAccount() {
        return Utils.info('Account info:',
            <DescriptionList items={[
                { term: 'Country:', description: this.props.country }
            ]}/>
        );
    }

    renderDataConnectionForm() {
        let storeSettings = this.storeSettings,
            disabled = this.isInactive;

        return <LocationSelectBox id="shopee-location-id" value={storeSettings.location_id} disabled={disabled}
                                  onChange={this.handleChange('location_id')}/>
    }

    renderDefaultProperties() {
        const defaultProperties = this.defaultProperties;

        if ( this.isConnected ) return (
            <FormLayout>
                <FormLayout.Group>
                    <TextField type="number" label="Days to ship" value={defaultProperties.days_to_ship}
                               onChange={this.handleChangeDefaultProperty('days_to_ship')}/>

                    <NomenclatureSelectBox id="default_properties_logistic" className="logistics-select-box"
                                           store={this.props.channel} entity="Logistic" label="Logistic"
                                           idAttr="logistic_id" textAttr="logistic_name"
                                           value={defaultProperties.logistic}
                                           onChange={this.handleChangeDefaultProperty('logistic')}/>
                </FormLayout.Group>
            </FormLayout>
        )
    }

    componentDidUpdate(prevProps) {
        if ( prevProps.channel !== this.props.channel ) this.setState({ notificationsLoaded: false })
    }
}
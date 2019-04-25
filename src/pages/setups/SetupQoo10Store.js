import React from 'react';
import {FormLayout, TextField, DescriptionList} from '@shopify/polaris';
import {SetupStore} from './SetupStore'
import {LocationSelectBox} from '../../common/LocationSelectBox'
import {PropertySelectBox} from '../../common/PropertySelectBox'
import {ProductQoo10} from "../products/ProductQoo10";
import logo from '../../images/qoo10_logo.png';
import {Utils} from "../../common/Utils";

export class SetupQoo10Store extends SetupStore {
    constructor(props) {
        super(props);

        this.state.avatarUrl = logo;

        this.handleAuthorize = this.handleConnect.bind(this);
    }

    get store() {
        return 'Qoo10'
    }

    renderDataConnectionForm() {
        let storeSettings = this.storeSettings,
            disabled = this.isInactive;

        return (
            <div>
                <TextField type="text" value={storeSettings.api_key} disabled={disabled}
                           label="API Key" onChange={this.handleChange('api_key')}/>
                <TextField type="text" value={storeSettings.user_id} disabled={disabled}
                           label="User ID" onChange={this.handleChange('user_id')}/>
                <TextField type="password" value={storeSettings.pwd} disabled={disabled}
                           label="Password" onChange={this.handleChange('pwd')}/>
                <TextField type="email" value={storeSettings.contact_email} disabled={disabled}
                           label="Contact email" onChange={this.handleChange('contact_email')}/>
                <TextField type="tel" value={storeSettings.contact_telephone} disabled={disabled}
                           label="Contact telephone" onChange={this.handleChange('contact_telephone')}/>
                <LocationSelectBox id="qoo10-location-id" value={storeSettings.location_id} disabled={disabled}
                                   onChange={this.handleChange('location_id')}/>
            </div>

        )
    }

    renderAccount() {
        const storeSettings = this.storeSettings;

        return Utils.info('Contact:',
            <DescriptionList items={[
                { term: 'Email:', description: storeSettings.contact_email },
                { term: 'Telephone:', description: storeSettings.contact_telephone }
            ]}/>
        );
    }

    renderDefaultProperties() {
        const default_properties = this.defaultProperties;

        if ( this.isConnected ) return (
            <FormLayout>
                <FormLayout.Group>
                    <PropertySelectBox label="Production place" id="default_properties_ProductionPlace"
                                       value={default_properties.ProductionPlace} tags={true}
                                       onChange={this.handleChangeDefaultProperty('ProductionPlace')}
                                       options={ProductQoo10.production_place_options}/>
                    <TextField type="text" label="Shipping No"
                               value={default_properties.ShippingNo}
                               onChange={this.handleChangeDefaultProperty('ShippingNo')}/>
                    <PropertySelectBox label="Adult item" id="default_properties_AdultYN"
                                       value={default_properties.AdultYN}
                                       onChange={this.handleChangeDefaultProperty('AdultYN')}
                                       options={ProductQoo10.adult_item_options}/>
                </FormLayout.Group>

                <FormLayout.Group>
                    <TextField type="text" label="Contact telephone"
                               value={default_properties.ContactTel}
                               onChange={this.handleChangeDefaultProperty('ContactTel')}/>
                    <TextField type="text" label="Contact email"
                               value={default_properties.ContactEmail}
                               onChange={this.handleChangeDefaultProperty('ContactEmail')}/>
                    <PropertySelectBox label="Industrial code type" id="default_properties_IndustrialCodeType"
                                       value={default_properties.IndustrialCodeType}
                                       onChange={this.handleChangeDefaultProperty('IndustrialCodeType')}
                                       options={ProductQoo10.industrial_code_type_options}/>
                </FormLayout.Group>
            </FormLayout>
        )
    }
}
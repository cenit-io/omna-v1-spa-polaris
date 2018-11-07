import React from 'react';
import {FormLayout, TextField, DescriptionList} from '@shopify/polaris';
import {SetupStore} from './SetupStore'
import {LocationSelectBox} from '../../common/LocationSelectBox'
import {PropertySelectBox} from '../../common/PropertySelectBox'
import {ProductQoo10} from "../products/ProductQoo10";
import logo from '../../images/qoo10_logo.png';

export class SetupQoo10 extends SetupStore {
    constructor(props) {
        super(props);

        this.state.store = 'Qoo10';
        this.state.avatarUrl = logo;

        this.handleAuthorize = this.handleConnect.bind(this);
    }

    initStoreSettings(appContext) {
        if ( this.state.storeSettings === undefined ) {
            this.state.storeSettings = {
                qoo10_api_key: '',
                qoo10_user_id: '',
                qoo10_pwd: '',
                qoo10_location_id: '',
                qoo10_contact_email: appContext.settings.qoo10_contact_email,
                qoo10_contact_telephone: appContext.settings.qoo10_contact_telephone,
                qoo10_default_properties: this.parseDefaultProperties(appContext),
            }
        }
    }

    renderDataConnectionForm() {
        const { storeSettings } = this.state;

        return (
            <FormLayout>
                <TextField type="text" value={storeSettings.qoo10_api_key}
                           label="API Key" onChange={this.handleChange('qoo10_api_key')}/>
                <TextField type="text" value={storeSettings.qoo10_user_id}
                           label="User ID" onChange={this.handleChange('qoo10_user_id')}/>
                <TextField type="password" value={storeSettings.qoo10_pwd}
                           label="Password" onChange={this.handleChange('qoo10_pwd')}/>
                <TextField type="email" value={storeSettings.qoo10_contact_email}
                           label="Contact email" onChange={this.handleChange('qoo10_contact_email')}/>
                <TextField type="tel" value={storeSettings.qoo10_contact_telephone}
                           label="Contact telephone" onChange={this.handleChange('qoo10_contact_telephone')}/>
                <LocationSelectBox id="qoo10-location-id" value={storeSettings.qoo10_location_id}
                                   onChange={this.handleChange('qoo10_location_id')}/>
            </FormLayout>

        )
    }

    renderAccount() {
        const { storeSettings } = this.state;

        return this.info('Contact:',
            <DescriptionList items={[
                { term: 'Email:', description: storeSettings.qoo10_contact_email },
                { term: 'Telephone:', description: storeSettings.qoo10_contact_telephone }
            ]}/>
        );
    }

    renderDefaultProperties() {
        const default_properties = this.defaultProperties;

        if ( this.isConnected ) return (
            <FormLayout>
                <FormLayout.Group>
                    <PropertySelectBox label="Production place" id="qoo10_default_properties_ProductionPlace"
                                       value={default_properties.ProductionPlace} tags={true}
                                       onChange={this.handleChangeDefaultProperty('ProductionPlace')}
                                       options={ProductQoo10.production_place_options}/>
                    <TextField type="text" label="Shipping No"
                               value={default_properties.ShippingNo}
                               onChange={this.handleChangeDefaultProperty('ShippingNo')}/>
                    <PropertySelectBox label="Adult item" id="qoo10_default_properties_AdultYN"
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
                    <PropertySelectBox label="Industrial code type" id="qoo10_default_properties_IndustrialCodeType"
                                       value={default_properties.IndustrialCodeType}
                                       onChange={this.handleChangeDefaultProperty('IndustrialCodeType')}
                                       options={ProductQoo10.industrial_code_type_options}/>
                </FormLayout.Group>
            </FormLayout>
        )
    }
}
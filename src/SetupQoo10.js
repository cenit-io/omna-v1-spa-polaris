import React from 'react';
import {FormLayout, TextField, DescriptionList, Banner} from '@shopify/polaris';
import {SetupStore, LocationSelectBox} from './SetupStore'
import {PropertySelectBox} from './ProductStore'
import {ProductQoo10} from "./ProductQoo10";

export class SetupQoo10 extends SetupStore {
    constructor(props) {
        super(props);

        const { OMNA } = window;

        this.state.store = 'Qoo10';
        this.state.connected = this.getValue('OMNA.settings.qoo10_connected');
        this.state.helpUri = 'https://support.omna.io/hc/en-us/articles/360012761651';
        this.state.avatarUrl = 'https://stcom.image-gmkt.com/css/us/qoo10/front/cm/common/image/app_q10_57.v_20160621.png';
        this.state.settings = {
            qoo10_api_key: '',
            qoo10_user_id: '',
            qoo10_pwd: '',
            qoo10_location_id: '',
            qoo10_contact_email: OMNA.settings.qoo10_contact_email,
            qoo10_contact_telephone: OMNA.settings.qoo10_contact_telephone,
            qoo10_default_properties: this.parseDefaultProperties(OMNA.settings.qoo10_default_properties),
        };

        this.handleAuthorize = this.handleConnect.bind(this);
    }

    renderModalContent() {
        const { settings } = this.state;

        return (
            <FormLayout>
                <TextField type="text" value={settings.qoo10_api_key}
                           label="API Key" onChange={this.handleChange('qoo10_api_key')}/>
                <TextField type="text" value={settings.qoo10_user_id}
                           label="User ID" onChange={this.handleChange('qoo10_user_id')}/>
                <TextField type="password" value={settings.qoo10_pwd}
                           label="Password" onChange={this.handleChange('qoo10_pwd')}/>
                <TextField type="email" value={settings.qoo10_contact_email}
                           label="Contact email" onChange={this.handleChange('qoo10_contact_email')}/>
                <TextField type="tel" value={settings.qoo10_contact_telephone}
                           label="Contact telephone" onChange={this.handleChange('qoo10_contact_telephone')}/>
                <LocationSelectBox id="qoo10-location-id" value={settings.qoo10_location_id}
                                   onChange={this.handleChange('qoo10_location_id')}/>
            </FormLayout>

        )
    }

    renderAccount() {
        const { connected, settings } = this.state;

        if ( connected ) {
            return this.info('Contact:',
                <DescriptionList items={[
                    { term: 'Email:', description: settings.qoo10_contact_email },
                    { term: 'Telephone:', description: settings.qoo10_contact_telephone }
                ]}/>
            );
        }
    }

    renderDefaultProperties() {
        const { connected, settings } = this.state;

        if ( connected ) return (
            <Banner title="Default properties" action={{
                content: 'Save', icon: 'save', disabled: this.state.sending,
                onAction: this.handleSaveDefaultProperties,
            }}>
                <FormLayout>
                    <FormLayout.Group>
                        <PropertySelectBox label="Production place" id="qoo10_default_properties_ProductionPlace"
                                           value={settings.qoo10_default_properties.ProductionPlace} tags={true}
                                           onChange={this.handleChange('qoo10_default_properties', 'ProductionPlace')}
                                           options={ProductQoo10.production_place_options}/>
                        <TextField type="text" label="Shipping No"
                                   value={settings.qoo10_default_properties.ShippingNo}
                                   onChange={this.handleChange('qoo10_default_properties', 'ShippingNo')}/>
                        <PropertySelectBox label="Adult item" id="qoo10_default_properties_AdultYN"
                                           value={settings.qoo10_default_properties.AdultYN}
                                           onChange={this.handleChange('qoo10_default_properties', 'AdultYN')}
                                           options={ProductQoo10.adult_item_options}/>
                    </FormLayout.Group>

                    <FormLayout.Group>
                        <TextField type="text" label="Contact telephone"
                                   value={settings.qoo10_default_properties.ContactTel}
                                   onChange={this.handleChange('qoo10_default_properties', 'ContactTel')}/>
                        <TextField type="text" label="Contact email"
                                   value={settings.qoo10_default_properties.ContactEmail}
                                   onChange={this.handleChange('qoo10_default_properties', 'ContactEmail')}/>
                        <PropertySelectBox label="Industrial code type" id="qoo10_default_properties_IndustrialCodeType"
                                           value={settings.qoo10_default_properties.IndustrialCodeType}
                                           onChange={this.handleChange('qoo10_default_properties', 'IndustrialCodeType')}
                                           options={ProductQoo10.industrial_code_type_options}/>
                    </FormLayout.Group>
                </FormLayout>
            </Banner>
        )
    }
}
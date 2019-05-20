import React from 'react';
import {AccountConnection, FooterHelp, Card, Banner, FormLayout} from '@shopify/polaris';
import {OMNAPageSection} from '../../pages/OMNAPageSection';
import {Utils} from "../../common/Utils";

export class SetupStore extends OMNAPageSection {
    constructor(props) {
        super(props);

        this.state.helpUri = 'https://omna.freshdesk.com/support/solutions/articles/43000169463-installing-and-activating-the-omna-application';
        this.state.sending = false;
    }

    handleChangeDefaultProperty(propertyName) {
        return this.handleChange('default_properties', propertyName)
    }

    handleSaveDefaultProperties = () => {
        let storeSettings = this.storeSettings,
            store = this.store,
            uri = this.urlTo('setup/default/properties'),
            data = this.requestParams({
                sch: store,
                default_properties: storeSettings.default_properties
            });

        this.loadingOn();
        this.setState({ sending: true });
        $.post({
            url: uri,
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json',
        }).done(() => {
            this.storeSettings.default_properties = data.default_properties;
            this.flashNotice('Default properties updated successfully in ' + store);
        }).fail((response) => {
            this.flashError('Failed to save default properties in ' + store + '. ' + Utils.parseResponseError(response));
        }).always(() => {
            this.loadingOff();
            this.setState({ sending: false });
        });
    };

    handleDisconnect = () => {
        let store = this.store,
            msg = 'Are you sure you want to disconnect OMNA from ' + store + '?';

        Utils.confirm(msg, (confirmed) => {
            if ( confirmed ) {
                const storeSettings = { connected: false, name: store };

                this.loadingOn();
                this.setState({ sending: true });
                $.getJSON(this.urlTo('setup'), this.queryParams({ setup: storeSettings })).done((response) => {
                    this.isConnected = false;
                }).fail((response) => {
                    this.flashError('Failed to setup ' + store + ' sales channel. ' + Utils.parseResponseError(response));
                }).always(() => {
                    this.loadingOff();
                    this.setState({ sending: false });
                });
            }
        });
    };

    handleChange(attr1, attr2) {
        return (value) => this.setState((prevState) => {
            const storeSettings = this.storeSettings;

            if ( attr2 ) {
                storeSettings[attr1] = storeSettings[attr1] || {};
                storeSettings[attr1][attr2] = value
            } else {
                storeSettings[attr1] = value;
            }

            return prevState;
        });
    }

    handleConnect = () => {
        let storeSettings = this.storeSettings,
            store = this.store;

        storeSettings.connected = true;
        storeSettings.name = store;

        this.loadingOn();
        this.setState({ sending: true });

        $.getJSON(this.urlTo('setup'), this.queryParams({ setup: storeSettings })).done((response) => {
            this.isConnected = true;
        }).fail((response) => {
            this.flashError('Failed to setup ' + store + ' sales channel. ' + Utils.parseResponseError(response));
        }).always(() => {
            this.loadingOff();
            this.setState({ sending: false });
        });
    };

    handleAuthorize = () => {
        let storeSettings = this.storeSettings,
            store = this.store;

        storeSettings.connected = true;
        storeSettings.name = store;

        open(this.urlTo('authorize?' + this.queryParams({ sch: store, settings: storeSettings })), '_parent')
    };

    get store() {
        return this.props.channel
    }

    get storeName() {
        return this.channelName(this.store, false, true)
    }

    get storeSettings() {
        let store = this.store,
            storeSettings = this.channels[store] = this.channels[store] || {
                name: store,
                connected: false,
            };

        return storeSettings
    }

    get defaultProperties() {
        return this.storeSettings.default_properties
    }

    get isValid() {
        const storeSettings = this.storeSettings;

        return !Object.keys(storeSettings).find((attr) => storeSettings[attr] === null || storeSettings[attr] === '')
    }

    get isConnected() {
        return this.storeSettings.connected;
    }

    set isConnected(state) {
        this.storeSettings.connected = state;
    }

    renderAccount() {
        return null
    }

    renderDeprecated() {
        const deprecated = this.storeSettings.deprecated;

        if ( deprecated ) return <Card>{Utils.warn(deprecated)}</Card>
    }

    renderDefaultProperties() {
        return null
    }

    renderDetails() {
        const { sending } = this.state;

        let account, action, form;

        if ( this.isConnected ) {
            account = this.renderAccount();

            if ( (form = this.renderDefaultProperties()) ) {
                action = {
                    content: 'Save',
                    icon: 'save',
                    disabled: sending,
                    onAction: this.handleSaveDefaultProperties
                };
                form = <Banner title="Default properties">{form}</Banner>
            }
        } else {
            action = {
                content: 'Enable',
                icon: 'checkmark',
                disabled: sending || this.isInactive || !this.isValid,
                onAction: this.handleAuthorize
            };
            form = <Banner title="Connection data"><FormLayout>{this.renderDataConnectionForm()}</FormLayout></Banner>
        }

        return (
            <Card primaryFooterAction={action}>{account}{form}</Card>
        )
    }

    renderWithAppContext(appContext) {
        const { helpUri, avatarUrl } = this.state;

        let disconnectAction, details,
            store = this.store,
            storeName = this.storeName;

        if ( this.isConnected ) {
            details = Utils.success('Is already enabled');
            disconnectAction = {
                content: 'Disable', icon: 'disable', destructive: true, onAction: this.handleDisconnect
            };
        } else {
            details = Utils.warn('Is not yet enabled');
        }

        return (
            <div className={'setup sale-channel ' + store + ' ' + (this.isConnected ? 'connected' : 'disconnected')}>
                {this.renderDeprecated()}
                {this.renderNotifications('Authorization', this.store)}
                <AccountConnection connected={this.isConnected} details={details} action={disconnectAction}
                                   accountName={'Synchronization with ' + storeName} avatarUrl={avatarUrl}
                                   termsOfService={this.renderDetails()}
                />
                <FooterHelp>
                    {'You can only have a single connection with a single ' + storeName + ' store. Learn more about '}
                    {Utils.renderExternalLink('how configure', helpUri)}
                    {' this store.'}
                </FooterHelp>
            </div>
        )
    }
}

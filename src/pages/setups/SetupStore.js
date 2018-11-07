import React from 'react';
import {AccountConnection, FooterHelp, Card, Banner} from '@shopify/polaris';
import {OMNAComponent} from '../../common/OMNAComponent';

export class SetupStore extends OMNAComponent {
    constructor(props) {
        super(props);

        this.state.store = 'None';
        this.state.helpUri = 'https://omna.freshdesk.com/support/solutions/articles/43000169463-installing-and-activating-the-omna-application';
        this.state.sending = false;
        this.state.storeSettings = undefined;

        this.handleSaveDefaultProperties = this.handleSaveDefaultProperties.bind(this);
        this.handleDisconnect = this.handleDisconnect.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleConnect = this.handleConnect.bind(this);
        this.handleAuthorize = this.handleAuthorize.bind(this);
    }

    handleChangeDefaultProperty(propertyName) {
        return this.handleChange(this.defaultPropertiesAttrName, propertyName)
    }

    handleSaveDefaultProperties() {
        const
            { store, storeSettings, appContext } = this.state,

            defaultPropertiesAttrName = this.defaultPropertiesAttrName,
            uri = this.urlTo('setup/default/properties'),
            data = this.requestParams({
                sch: store,
                default_properties: storeSettings[defaultPropertiesAttrName]
            });

        this.loadingOn();
        this.setState({ sending: true });
        $.post(uri, data, 'json').done(() => {
            appContext.settings[defaultPropertiesAttrName] = data.default_properties;
            this.flashNotice('Default properties updated successfully in ' + store);
        }).fail((response) => {
            const error = response.responseJSON ? response.responseJSON.error : response.responseText;
            this.flashError('Failed to save default properties in ' + store + '. ' + error);
            console.error(response);
        }).always(() => {
            this.loadingOff();
            this.setState({ sending: false });
        });
    }

    handleDisconnect() {
        const { store } = this.state;

        const msg = 'Are you sure you want to disconnect OMNA from ' + store + '?';

        this.confirm(msg, (confirmed) => {
            if ( confirmed ) {
                const storeSettings = {};

                this.loadingOn();
                this.setState({ sending: true });
                storeSettings[String(store).toLowerCase() + '_enabled'] = 'no';

                $.getJSON(this.urlTo('setup'), this.queryParams({ setup: storeSettings })).done((response) => {
                    this.isConnected = false;
                }).fail((response) => {
                    const error = response.responseJSON ? response.responseJSON.error : response.responseText;
                    this.flashError('Failed to setup ' + store + ' sales channel. ' + error);
                }).always(() => {
                    this.loadingOff();
                    this.setState({ sending: false });
                });
            }
        });
    }

    handleChange(attr1, attr2) {
        return (value) => this.setState((prevState) => {
            if ( attr2 ) {
                prevState.storeSettings[attr1] = prevState.storeSettings[attr1] || {};
                prevState.storeSettings[attr1][attr2] = value
            } else {
                prevState.storeSettings[attr1] = value;
            }

            return prevState;
        });
    }

    handleConnect() {
        const
            { store, storeSettings } = this.state,
            prefix = store.toLowerCase();

        storeSettings[prefix + '_enabled'] = 'yes';
        storeSettings[prefix + '_sale_channel_name'] = store;

        this.loadingOn();
        this.setState({ sending: true });

        $.getJSON(this.urlTo('setup'), this.queryParams({ setup: storeSettings })).done((response) => {
            this.isConnected = true;
        }).fail((response) => {
            const error = response.responseJSON ? response.responseJSON.error : response.responseText;
            this.flashError('Failed to setup ' + store + ' sales channel. ' + error);
        }).always(() => {
            this.loadingOff();
            this.setState({ sending: false });
        });
    }

    handleAuthorize() {
        const
            { store, storeSettings } = this.state,
            prefix = store.toLowerCase();

        storeSettings[prefix + '_enabled'] = 'yes';
        storeSettings[prefix + '_sale_channel_name'] = store;

        open(this.urlTo('authorize?' + this.queryParams({ sch: store, settings: storeSettings })), '_parent');
    }

    get defaultPropertiesAttrName() {
        return this.state.store.toLowerCase() + '_default_properties';
    }

    get defaultProperties() {
        return this.state.storeSettings[this.defaultPropertiesAttrName];
    }

    get isValid() {
        const { storeSettings } = this.state;
        return !Object.keys(storeSettings).find((attr) => storeSettings[attr] === null || storeSettings[attr] === '')
    }

    get isConnected() {
        const { store, appContext } = this.state;

        return appContext.settings[store.toLowerCase() + '_connected'];
    }

    set isConnected(state) {
        const { store, appContext } = this.state;

        appContext.settings[store.toLowerCase() + '_connected'] = state;
    }

    initStoreSettings(appContext) {
        this.state.storeSettings = {}
    }

    parseDefaultProperties(appContext) {
        const dp = appContext.settings[this.defaultPropertiesAttrName];

        return dp ? ((typeof dp === 'string') ? JSON.parse(dp) : dp) : {}
    }

    renderAccount() {
        return null
    }

    renderDefaultProperties() {
        return null
    }

    renderDetails() {
        const { sending } = this.state;

        var account, action, form;

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
                content: 'Connect',
                icon: 'checkmark',
                disabled: sending || !this.isValid,
                onAction: this.handleAuthorize
            };
            form = <Banner title="Connection data">{this.renderDataConnectionForm()}</Banner>
        }

        return (
            <Card primaryFooterAction={action}>{account}{form}</Card>
        )
    }

    renderWithAppContext(appContext) {
        const { store, helpUri, avatarUrl } = this.state;

        var disconnectAction, details;

        this.initStoreSettings(appContext);

        if ( this.isConnected ) {
            details = this.success('Is connected');
            disconnectAction = {
                content: 'Disconnect', icon: 'disable', destructive: true, onAction: this.handleDisconnect
            };
        } else {
            details = this.warn('Is not yet connected');
        }

        return (
            <div className={'setup sale-channel ' + store + ' ' + (this.isConnected ? 'connected' : 'disconnected')}>
                <AccountConnection connected={this.isConnected} details={details} action={disconnectAction}
                                   accountName={store + ' Synchronization'} avatarUrl={avatarUrl}
                                   termsOfService={this.renderDetails()}
                />
                <FooterHelp>
                    {'You can only have a single connection with a single ' + store + ' store. Learn more about '}
                    {this.renderExternalLink('how configure', helpUri)}
                    {' this store.'}
                </FooterHelp>
            </div>
        )
    }
}

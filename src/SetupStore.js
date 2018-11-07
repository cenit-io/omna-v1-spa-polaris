import React from 'react';
import {AccountConnection, Modal, Labelled, FooterHelp} from '@shopify/polaris';
import {OMNAComponent} from './Commons';

export class LocationSelectBox extends OMNAComponent {
    onChange(e) {
        this.props.onChange($(e.target).val());
    }

    render() {
        const
            { id, value, required } = this.props,
            selectedOption = value ? <option value={value}></option> : null;

        return (
            <div className="location-select-box">
                <Labelled id={id}>Stock location{required ? ' *' : ''}</Labelled>
                <select id={id} defaultValue={value} style={{ width: '100%' }}>{selectedOption}</select>
            </div>
        )
    }

    componentDidMount() {
        const
            uri = this.urlTo('locations'),
            selector = '#' + this.props.id;

        $(selector).select2({
            initSelection: function (element, callback) {
                if ( element.val() ) {
                    const params = this.requestParams({ sch: this.props.store, id: element.val() });

                    return $.getJSON(uri, params, function (data) {
                        return data.item ? callback({ id: data.item.id, text: data.item.name }) : null;
                    });
                }
            }.bind(this),

            ajax: {
                url: uri,
                dataType: 'json',
                data: function (params) {
                    params.page = params.page || 1;

                    return this.requestParams({
                        sch: this.props.store,
                        q: { p: params.page, s: params.term }
                    });
                }.bind(this),

                processResults: function (data, params) {
                    var items = data.items.map(function (item) {
                        return { id: item.id, text: item.name }
                    });
                    params.page = params.page || 1;

                    return { results: items, pagination: { more: params.page < data.pages } };
                }
            }
        });

        $(selector).on('change', this.onChange.bind(this));
    }
}

export class SetupStore extends OMNAComponent {
    constructor(props) {
        super(props);

        this.state.connected = false;
        this.state.store = 'None';
        this.state.settings = {};
        this.state.helpUri = 'https://support.omna.io';
        this.state.sending = false;

        this.handleSaveDefaultProperties = this.handleSaveDefaultProperties.bind(this);
        this.handleActiveSaleChannels = this.handleActiveSaleChannels.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleConnect = this.handleConnect.bind(this);
        this.handleAuthorize = this.handleAuthorize.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    handleSaveDefaultProperties() {
        const
            { store, settings } = this.state,
            property = store.toLowerCase() + '_default_properties',
            uri = this.urlTo('setup/default/properties'),
            data = this.requestParams({
                sch: store,
                default_properties: settings[property]
            });

        this.loadingOn();
        this.setState({ sending: true });
        $.post(uri, data, 'json').done(function (response) {
            window.OMNA.settings[property] = settings[property];
            this.flashNotice('Default properties updated successfully in ' + store);
        }.bind(this)).fail(function (response) {
            const error = response.responseJSON ? response.responseJSON.error : '';
            this.flashError('Failed to save default properties in ' + store + '. ' + error);
            console.error(response);
        }.bind(this)).always(function () {
            this.setState({ sending: false });
            this.loadingOff();
        }.bind(this));
    }

    handleActiveSaleChannels() {
        const { store, connected } = this.state;

        if ( connected ) {
            const msg = 'Are you sure you want to disconnect OMNA from ' + store + '?';

            this.confirm(msg, function (confirmed) {
                if ( confirmed ) {
                    const settings = {};

                    this.loadingOn();
                    this.setState({ sending: true });
                    settings[String(store).toLowerCase() + '_enabled'] = 'no';

                    $.getJSON(this.urlTo('setup'), this.queryParams({ setup: settings })).done(function (response) {
                        this.setConnectionState(false)
                    }.bind(this)).fail(function (response) {
                        const error = response.responseJSON ? response.responseJSON.error : '';
                        this.flashError('Failed to setup ' + store + ' sales channel. ' + error);
                    }.bind(this)).always(function () {
                        this.loadingOff();
                        this.setState({ sending: false });
                    }.bind(this));
                }
            }.bind(this));
        } else {
            this.setState(({ openDlg }) => ({ openDlg: !openDlg }));
        }
    }

    handleChange(attr1, attr2) {
        return (value) => this.setState((prevState) => {
            if ( attr2 ) {
                prevState.settings[attr1] = prevState.settings[attr1] || {};
                prevState.settings[attr1][attr2] = value
            } else {
                prevState.settings[attr1] = value;
            }
            return prevState;
        });
    }

    handleConnect() {
        const
            { store, settings } = this.state,
            prefix = store.toLowerCase();

        settings[prefix + '_enabled'] = 'yes';
        settings[prefix + '_sale_channel_name'] = store;

        this.handleClose();
        this.loadingOn();
        this.setState({ sending: true });

        $.getJSON(this.urlTo('setup'), this.queryParams({ setup: settings })).done(function (response) {
            this.setConnectionState(true);
        }.bind(this)).fail(function (response) {
            const error = response.responseJSON ? response.responseJSON.error : '';
            this.flashError('Failed to setup ' + store + ' sales channel. ' + error);
        }.bind(this)).always(function () {
            this.loadingOff();
            this.setState({ sending: false });
        }.bind(this));
    }

    handleAuthorize() {
        const
            { store, settings } = this.state,
            prefix = store.toLowerCase();

        settings[prefix + '_enabled'] = 'yes';
        settings[prefix + '_sale_channel_name'] = store;

        open(this.urlTo('authorize?' + this.queryParams({ sch: store, settings: settings })), '_parent');
    }

    handleClose() {
        this.setState(({ openDlg }) => ({ openDlg: !openDlg }));
    }

    setConnectionState(state) {
        const
            { store } = this.state,
            { OMNA } = window;

        OMNA.settings[store.toLowerCase() + '_connected'] = state;
        this.setState({ connected: state });
    }

    isValid() {
        const { settings } = this.state;

        return !Object.keys(settings).find((attr) => settings[attr] === null || settings[attr] === '')
    }

    parseDefaultProperties(dp) {
        return dp ? ((typeof dp == 'string') ? JSON.parse(dp) : dp) : {}
    }

    renderAccount() {
        return null
    }

    renderDefaultProperties() {
        return null
    }

    renderDetails() {
        return (
            <div>
                {this.renderAccount()}
                {this.renderDefaultProperties()}
            </div>
        )
    }

    render() {
        const { openDlg, connected, store, helpUri, avatarUrl } = this.state;

        return (
            <div className={'account-' + (connected ? 'connected' : 'disconnected')}>
                <AccountConnection
                    connected={connected}
                    avatarUrl={avatarUrl}
                    details={connected ? this.success('Is connected') : this.warn('Is not yet connected')}
                    accountName={store + ' Synchronization'}
                    action={{
                        content: connected ? 'Disconnect' : 'Connect',
                        icon: connected ? 'disable' : 'checkmark',
                        destructive: connected,
                        disabled: this.isInactive() || this.state.sending,
                        onAction: this.handleActiveSaleChannels
                    }}
                    termsOfService={this.renderDetails()}
                />
                <Modal
                    open={openDlg} limitHeight={false}
                    onClose={this.handleClose.bind(this)}
                    title={store + ' settings:'}
                    primaryAction={{ content: 'Connect', onAction: this.handleAuthorize, disabled: !this.isValid() }}>
                    <Modal.Section>{this.renderModalContent()}</Modal.Section>
                </Modal>
                <FooterHelp>
                    {'You can only have a single connection with a single ' + store + ' store. Learn more about '}
                    {this.renderHelpLink('how configure', helpUri)}
                    {' this store.'}
                </FooterHelp>
            </div>
        )
    }
}

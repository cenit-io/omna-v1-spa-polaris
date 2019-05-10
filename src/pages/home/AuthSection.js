import React from 'react';
import {Card, TextField, FormLayout, Link} from '@shopify/polaris';
import {OMNAPageSection} from "../OMNAPageSection";
import {ArrowRightMinor as nextIcon, LogOutMinor} from '@shopify/polaris-icons';
import {Utils} from "../../common/Utils";
import jwt from 'jwt-simple';

export class AuthSection extends OMNAPageSection {
    handleChangeShopDomain = (value) => {
        let validatorRegExp = /^([\wñáéíóú]+([\-.][\wñáéíóú])?)+(\.myshopify\.com)?$/i;

        value = value.replace(/\.myshopify\.com$/, '');

        this.setState({
            shopDomain: value,
            shopDomainError: value.match(validatorRegExp) ? false : 'Invalid store name.'
        });
    };

    handleChangePassword = (value, pField) => {
        // ^	                            The password string will start this way
        // (?=.*[a-zñáéíóú])	            The string must contain at least 1 lowercase alphabetical character
        // (?=.*[A-ZÑÁÉÍÓÚ])	            The string must contain at least 1 uppercase alphabetical character
        // (?=.*[0-9])	                    The string must contain at least 1 numeric character
        // (?=.*[^a-zñáéíóúA-ZÑÁÉÍÓÚ0-9])	The string must contain at least one special character
        // (?=.{8,})	                    The string must be eight characters or longer

        this.state[pField] = value;

        let { password1, password2 } = this.state,
            validatorRegExp = /^(?=.*[a-zñáéíóú])(?=.*[A-ZÑÁÉÍÓÚ])(?=.*[0-9])(?=.*[^a-zñáéíóúA-ZÑÁÉÍÓÚ0-9])(?=.{8,})/;

        this.setState({
            password1Error: this.isAuthorized || password1.match(validatorRegExp) ? false : 'Invalid password.',
            password2Error: this.isAuthorized || password1 === password2 ? false : 'Not match.'
        });
    };

    handleCheckShopDomain = () => {
        this.setState({ sending: true });
        Utils.loadSettings({ shop: this.shopDomain }).then((settings) => {
            let notifications;

            this.appSettings = settings;

            if ( !this.isRegistered ) {
                notifications = [{
                    status: 'warning', message: 'You have never logged in, please set and confirm your password.'
                }]
            } else if ( !this.isAuthorized ) {
                notifications = [{ status: 'warning', message: 'The OMNA application is not installed in this store.' }]
            }

            this.setState({ sending: false, notifications: notifications });
        }).catch((error) => {
            this.setState({ sending: false, notifications: [{ status: 'error', message: error }] });
        })
    };

    handleInstall = () => {
        window.open(this.appSettings.authorize_uri, '_parent');
    };

    handleSignUp = () => {
        this.signActionRequest('sign_un').done((response) => {
            let password1Error, notifications = [];

            this.appSettings = response.settings;

            if ( this.isAuthenticated ) {
                Utils.renderPage('home', null, response.settings)
            } else {
                notifications.push({ status: 'warning', message: 'Invalid password.' });
            }

            this.setState({ sending: false, password1Error: password1Error, notifications: notifications });
        });
    };

    handleSignIn = () => {
        this.signActionRequest('sign_in').done((response) => {
            let password1Error, notifications = [];

            this.appSettings = response.settings;

            if ( this.isAuthenticated ) {
                Utils.renderPage('home', null, response.settings)
            } else {
                notifications.push({ status: 'warning', message: 'Invalid password.' });
                password1Error = 'Invalid password.';
            }

            this.setState({ sending: false, password1Error: password1Error, notifications: notifications });
        });
    };

    handleSignOut = () => {
        this.signActionRequest('sign_out').done(() => {
            Utils.renderPage('home', null, {});
            this.handleCancel();
        });
    };

    handleCancel = () => {
        this.appSettings = {};
        this.setState({ sending: false, notifications: null, shopDomain: null, password1: null, password2: null })
    };

    processFailRequest = (response) => {
        let error = Utils.parseResponseError(response);
        this.setState({
            sending: false, password1Error: error, notifications: [{ status: 'critical', message: error }]
        });
    };

    signActionRequest(action) {
        let data = { shop: this.shopDomain };

        if ( action.match(/sign_(in|up)/) ) data.password = this.password;

        this.setState({ sending: true });
        return $.post({
            url: this.urlTo(action),
            data: this.requestParams(data),
            xhrFields: { withCredentials: true },
            dataType: 'json',
        }).fail(this.processFailRequest)
    }

    get appSettings() {
        return this.state.appContext.settings || {}
    }

    set appSettings(value) {
        this.state.appContext.settings = value
    }

    get title() {
        if ( !this.hasShopDomain ) return 'Sign IN';
        if ( !this.isAuthorized ) return 'Install OMNA application in this store:';
        if ( !this.isRegistered ) return 'Sign UP';
        if ( !this.isAuthenticated ) return 'Sign IN';

        return 'Welcome:'
    }

    get shopDomain() {
        let { shopDomain } = this.state;

        return shopDomain + (shopDomain.match(/\.myshopify\.com$/) ? '' : '.myshopify.com')
    }

    get password() {
        return jwt.encode({ password: this.state.password1 }, this.appSettings.one_way_token, 'HS256')
    }

    get isValid() {
        let { shopDomain, shopDomainError, password1, password1Error, password2Error } = this.state;

        if ( this.isAuthenticated ) return true;
        if ( !this.hasShopDomain ) return shopDomain && !shopDomainError;
        if ( !this.isRegistered ) return password1 && !password1Error && !password2Error;

        return password1 && !password1Error;
    }

    get hasShopDomain() {
        return !!this.appSettings.shop_domain
    }

    get isAuthorized() {
        let { status } = this.appSettings;

        return status && status !== 'unauthorized'
    }

    get isRegistered() {
        return this.isAuthorized && this.appSettings.status !== 'unregistered'
    }

    get isAuthenticated() {
        return this.appSettings.status === 'authenticated'
    }

    get primaryFooterAction() {
        let handleAction,
            content = 'Sign IN',
            icon = nextIcon,
            destructive = false;

        if ( !this.hasShopDomain ) {
            handleAction = this.handleCheckShopDomain;
        } else if ( !this.isAuthorized ) {
            content = 'Install';
            handleAction = this.handleInstall;
        } else if ( !this.isRegistered ) {
            content = 'Sign UP';
            handleAction = this.handleSignUp;
        } else if ( !this.isAuthenticated ) {
            handleAction = this.handleSignIn;
        } else {
            content = 'Sign Out';
            handleAction = this.handleSignOut;
            destructive = true;
            icon = LogOutMinor;
        }

        return {
            content: content,
            icon: icon,
            destructive: destructive,
            disabled: this.state.sending || !this.isValid,
            loading: this.state.sending,
            onAction: handleAction
        }
    }

    get secondaryFooterAction() {
        if ( this.hasShopDomain && !this.isAuthenticated && !this.state.sending )
            return {
                content: 'Cancel',
                icon: 'cancelSmall',
                destructive: true,
                onAction: this.handleCancel
            }
    }

    renderShopDomainField() {
        if ( this.isAuthenticated ) return;

        let { shopDomain, shopDomainError, sending } = this.state;

        return (
            <TextField type="text" value={shopDomain} error={shopDomainError} readOnly={false}
                       label="Shopify store's name:"
                       helpText={shopDomain ? "Shop domain: " + this.shopDomain : ''}
                       placeholder="my-store-name.myshopify.com"
                       disabled={this.hasShopDomain || sending}
                       onChange={this.handleChangeShopDomain}/>
        )
    }

    renderPassword1Field() {
        if ( !this.hasShopDomain || !this.isAuthorized || this.isAuthenticated ) return;

        let { password1, password1Error, sending } = this.state,
            helpText = this.isAuthorized ? null : 'Must contain at least 8 characters, lowercase, uppercase, numbers and special characters';

        return (
            <TextField type="password" id="password1" value={password1} error={password1Error} readOnly={false}
                       label="Enter your password:"
                       helpText={helpText}
                       disabled={sending}
                       onChange={this.handleChangePassword}/>
        )
    }

    renderPassword2Field() {
        if ( !this.hasShopDomain || !this.isAuthorized || this.isRegistered ) return;

        let { password2, password2Error, sending } = this.state;

        return (
            <TextField type="password" id="password2" value={password2} error={password2Error} readOnly={false}
                       label="Confirm your password:"
                       disabled={sending}
                       onChange={this.handleChangePassword}/>
        )
    }

    renderCurrentShopDomain() {
        if ( !this.isAuthenticated ) return;

        return Utils.success(
            <span>
                {'You are authenticate as '}
                <b>{this.state.shopDomain}</b>
                {' that work over '}
                <b><Link url={'https://' + this.shopDomain + '/admin'} external={true}>{this.shopDomain}</Link></b>
                {' as principal store.'}
            </span>
        )
    }

    renderWithAppContext(appContext) {
        let { shopDomain } = this.state;

        if ( !shopDomain && this.hasShopDomain ) {
            setTimeout(this.handleChangeShopDomain, 0, this.appSettings.shop_domain);
            return Utils.renderLoading()
        }

        return (
            <div>
                {this.renderNotifications()}

                <Card sectioned title={this.title}
                      primaryFooterAction={this.primaryFooterAction}
                      secondaryFooterAction={this.secondaryFooterAction}>
                    <FormLayout>
                        {this.renderCurrentShopDomain()}
                        {this.renderShopDomainField()}
                        {this.renderPassword1Field()}
                        {this.renderPassword2Field()}
                    </FormLayout>
                </Card>
            </div>
        );
    }
}
import React from 'react';
import {Card, TextField, FormLayout, Link} from '@shopify/polaris';
import {OMNAPageSection} from "../OMNAPageSection";
import {ArrowRightMinor as nextIcon, LogOutMinor} from '@shopify/polaris-icons';
import {Utils} from "../../common/Utils";

export class AuthSection extends OMNAPageSection {
    constructor(props) {
        super(props);

        this.state.shopDomain = null;
        this.state.sending = false;
    }

    handleChangeShopDomain = (value) => {
        let validatorRegExp = /^([\wñáéíóú]+([\-.][\wñáéíóú])?)+(\.myshopify\.com)?$/i;

        value = value.replace(/\.myshopify\.com$/, '');

        this.setState({
            shopDomain: value,
            shopDomainError: value.match(validatorRegExp) ? false : 'Invalid store domain.'
        });
    };

    handleChangePassword = (value) => {
        // ^	                            The password string will start this way
        // (?=.*[a-zñáéíóú])	            The string must contain at least 1 lowercase alphabetical character
        // (?=.*[A-ZÑÁÉÍÓÚ])	            The string must contain at least 1 uppercase alphabetical character
        // (?=.*[0-9])	                    The string must contain at least 1 numeric character
        // (?=.*[^a-zñáéíóúA-ZÑÁÉÍÓÚ0-9])	The string must contain at least one special character
        // (?=.{8,})	                    The string must be eight characters or longer

        let validatorRegExp = /^(?=.*[a-zñáéíóú])(?=.*[A-ZÑÁÉÍÓÚ])(?=.*[0-9])(?=.*[^a-zñáéíóúA-ZÑÁÉÍÓÚ0-9])(?=.{8,})/;

        this.setState({
            password: value,
            passwordError: value.match(validatorRegExp) ? false : 'Invalid password.'
        });
    };

    handleCheckShopDomain = () => {
        this.setState({ sending: true });
        Utils.loadSettings({ shop: this.shopDomain }, (settings) => {
            let notifications;

            this.appSettings = settings;

            if ( !this.isAuthorized ) {
                notifications = [{ status: 'warning', message: 'The OMNA application is not installed in this store.' }]
            }

            this.setState({ sending: false, notifications: notifications });
        })
    };

    handleInstall = () => {
        window.open(this.appSettings.authorize_uri, '_parent');
    };

    handleSignIn = () => {
        this.setState({ sending: true });
        Utils.loadSettings(this.requestParams({ shop: this.shopDomain, password: this.state.password }), (settings) => {
            let notifications;

            this.appSettings = settings;

            if ( !this.isAuthenticated ) {
                notifications = [{ status: 'warning', message: 'Invalid credential.' }];
            } else {
                Utils.renderPage('home', null, settings)
            }

            this.setState({ sending: false, notifications: notifications });
        })
    };

    handleSignOut = () => {
    };

    handleCancel = () => {
        this.appSettings = {};
        this.setState({ sending: false, notifications: null })
    };

    get appSettings() {
        return this.state.appContext.settings || {}
    }

    set appSettings(value) {
        this.state.appContext.settings = value
    }

    get title() {
        if ( !this.hasShopDomain ) return 'Sign IN';
        if ( !this.isAuthorized ) return 'Install OMNA application in this store:';
        if ( !this.isAuthenticated ) return 'Sign IN';

        return 'Welcome:'
    }

    get shopDomain() {
        let { shopDomain } = this.state;

        return shopDomain + (shopDomain.match(/\.myshopify\.com$/) ? '' : '.myshopify.com')
    }

    get isValid() {
        let { shopDomain, shopDomainError } = this.state;

        return shopDomain && !shopDomainError
    }

    get hasShopDomain() {
        return !!this.appSettings.shop_domain
    }

    get isAuthorized() {
        let { status } = this.appSettings;

        return status && status !== 'unauthorized'
    }

    get isAuthenticated() {
        let { status } = this.appSettings;

        return this.isAuthorized && status !== 'unauthenticated'
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
            onAction: handleAction,
            destructive: destructive,
            disabled: this.state.sending || !this.isValid
        }
    }

    get secondaryFooterAction() {
        if ( this.hasShopDomain && !this.isAuthenticated )
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

    renderPasswordField() {
        if ( !this.hasShopDomain || !this.isAuthorized || this.isAuthenticated ) return;

        let { password, passwordError, sending } = this.state;

        return (
            <TextField type="password" value={password} error={passwordError} readOnly={false}
                       label="Enter your password:"
                       helpText="Must contain at least 8 characters, lowercase, uppercase, numbers and special characters"
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

        if ( shopDomain === null && this.hasShopDomain ) {
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
                        {this.renderPasswordField()}
                    </FormLayout>
                </Card>
            </div>
        );
    }
}
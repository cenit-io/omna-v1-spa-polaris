import React from 'react';
import {Card, TextField, FormLayout, Link} from '@shopify/polaris';
import {OMNAPageSection} from "../OMNAPageSection";
import {ArrowRightMinor as nextIcon, LogOutMinor} from '@shopify/polaris-icons';
import {Utils} from "../../common/Utils";
import {sha256} from 'js-sha256';
import {Base64} from 'js-base64';

export class AuthSection extends OMNAPageSection {
    constructor(props) {
        super(props);

        this.state.shopDomain = null;
        this.state.currentPassword = null;
        this.state.password1 = null;
        this.state.password2 = null;
    }

    handleChangeShopDomain = (value) => {
        this.setState({ shopDomain: value.replace(/\.myshopify\.com$/, '') });
    };

    handleChangeCommonField = (value, field) => {
        this.setState((prevState) => {
            prevState[field] = value;
            prevState[field + 'Error'] = !value ? 'Required' : null;
            return prevState;
        });
    };

    handleChangePassword = (value, field) => {
        this.setState((prevState) => {
            prevState[field] = value;
            return prevState;
        });
    };

    handleCheckShopDomain = () => {
        this.setState({ sending: true });
        Utils.loadSettings({ shop: this.shopDomain, force_new_session: true }).then((settings) => {
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
        this.signActionRequest('sign_up').done((response) => {
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
        this.signActionRequest('sign_out').done((response) => {
            Utils.renderPage('home', null, response.settings);
            this.setState({ sending: false, notifications: null, password1: null, password2: null })
        });
    };

    handleCancel = () => {
        let { changeCurrentPassword, forgotPassword, shopDomain } = this.state;

        if ( !this.isAuthenticated && !forgotPassword ) this.appSettings = {};
        this.setState({
            sending: false,
            notifications: null,
            shopDomain: (changeCurrentPassword || forgotPassword) ? shopDomain : null,
            password1: null,
            password2: null,
            forgotPassword: false,
            changeCurrentPassword: false
        })
    };

    handleForgotPassword = () => {
        this.setState({ forgotPassword: true })
    };

    handleChangeCurrentPassword = () => {
        this.setState({ changeCurrentPassword: true, currentPassword: null, password1: null, password2: null })
    };

    processFailRequest = (response) => {
        let error = Utils.parseResponseError(response);
        this.setState({
            sending: false, password1Error: error, notifications: [{ status: 'critical', message: error }]
        });
    };

    signActionRequest(action) {
        let data = { shop: this.shopDomain };

        if ( action === 'sign_up' ) {
            data.password = this.passwordEncoded1
        } else if ( action === 'sign_in' ) {
            data.password = this.passwordEncoded2
        }

        this.setState({ sending: true });
        return $.post({
            url: this.urlTo(action),
            data: this.requestParams(data),
            xhrFields: { withCredentials: true },
            dataType: 'json',
        }).fail(this.processFailRequest)
    }

    get password1Error() {
        // ^	                            The password string will start this way
        // (?=.*[a-zñáéíóú])	            The string must contain at least 1 lowercase alphabetical character
        // (?=.*[A-ZÑÁÉÍÓÚ])	            The string must contain at least 1 uppercase alphabetical character
        // (?=.*[0-9])	                    The string must contain at least 1 numeric character
        // (?=.*[^a-zñáéíóúA-ZÑÁÉÍÓÚ0-9])	The string must contain at least one special character
        // (?=.{8,})	                    The string must be eight characters or longer

        let { changeCurrentPassword, forgotPassword, password1 } = this.state,
            needValidation = (password1 !== null) && (!this.isRegistered || forgotPassword || changeCurrentPassword),
            validatorRegExp = /^(?=.*[a-zñáéíóú])(?=.*[A-ZÑÁÉÍÓÚ])(?=.*[0-9])(?=.*[^a-zñáéíóúA-ZÑÁÉÍÓÚ0-9])(?=.{8,})/;

        return needValidation && !password1.match(validatorRegExp) ? 'Invalid password.' : false
    };

    get shopDomainError() {
        let { shopDomain } = this.state,
            validatorRegExp = /^([\wñáéíóú]+([\-.][\wñáéíóú])?)+(\.myshopify\.com)?$/i;
        console.log(shopDomain);
        return shopDomain !== null && !this.shopDomain.match(validatorRegExp) ? 'Invalid store name.' : false;
    };

    get password2Error() {
        let { changeCurrentPassword, forgotPassword, password1, password2 } = this.state,
            needValidation = (password2 !== null) && (!this.isRegistered || forgotPassword || changeCurrentPassword);

        return needValidation && password1 !== password2 ? 'Not match.' : false
    };

    get passwordEncoded1() {
        let str1 = [...Base64.encode(this.state.password1)].reverse(),
            str2 = [...this.appSettings.one_way_token];

        return Base64.encode(str1.map((c, i) => c + str2[i % str2.length]).join(''))
    }

    get passwordEncoded2() {
        let password = sha256.hmac.update(this.shopDomain, this.state.password1).hex();

        return sha256.hmac.update(this.appSettings.one_way_token, password).hex();
    }

    get title() {
        let { changeCurrentPassword, forgotPassword } = this.state;

        if ( !this.hasShopDomain ) return 'Sign IN:';
        if ( !this.isAuthorized ) return 'Install OMNA application in this store:';
        if ( !this.isRegistered ) return 'Sign UP:';
        if ( forgotPassword ) return 'Reset password:';
        if ( changeCurrentPassword ) return 'Change your current password:';
        if ( !this.isAuthenticated ) return 'Sign IN:';

        return 'Welcome:'
    }

    get shopDomain() {
        let { shopDomain } = this.state;

        return shopDomain + (shopDomain.match(/\.myshopify\.com$/) ? '' : '.myshopify.com')
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

    get headerActions() {
        let { changeCurrentPassword, forgotPassword } = this.state,
            actions = [];

        if ( this.isAuthenticated ) {
            changeCurrentPassword || actions.push({
                content: 'Change password', onAction: this.handleChangeCurrentPassword
            });
        } else if ( this.isAuthorized ) {
            forgotPassword || actions.push({
                content: 'Forgot password', onAction: this.handleForgotPassword
            });
        }

        return actions
    }

    get primaryFooterAction() {
        let { shopDomain, password1, currentPassword, changeCurrentPassword, forgotPassword, forgotPasswordCode } = this.state,

            handleAction,
            content = 'Sign IN',
            valid = true,
            icon = nextIcon,
            destructive = false;

        if ( !this.hasShopDomain ) {
            handleAction = this.handleCheckShopDomain;
            valid = shopDomain && !this.shopDomainError
        } else if ( !this.isAuthorized ) {
            content = 'Install';
            handleAction = this.handleInstall;
        } else if ( !this.isRegistered ) {
            content = 'Sign UP';
            handleAction = this.handleSignUp;
            valid = password1 && !this.password1Error && !this.password2Error
        } else if ( forgotPassword ) {
            content = 'Reset password';
            handleAction = this.handleSignUp;
            valid = forgotPasswordCode && password1 && !this.password1Error && !this.password2Error
        } else if ( changeCurrentPassword ) {
            content = 'Change password';
            handleAction = this.handleSignUp;
            valid = currentPassword && password1 && !this.password1Error && !this.password2Error
        } else if ( !this.isAuthenticated ) {
            handleAction = this.handleSignIn;
            valid = !!password1
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
            disabled: this.state.sending || !valid,
            loading: this.state.sending,
            onAction: handleAction
        }
    }

    get secondaryFooterAction() {
        let { changeCurrentPassword, forgotPassword, sending } = this.state;

        if ( !this.hasShopDomain || sending || ((Utils.inIframe || this.isAuthenticated) && !changeCurrentPassword && !forgotPassword) ) return;

        return {
            content: 'Cancel',
            icon: 'cancelSmall',
            destructive: true,
            onAction: this.handleCancel
        }
    }

    renderShopDomainField() {
        if ( this.isAuthenticated ) return;

        let { shopDomain, sending } = this.state;

        return (
            <TextField type="text" id="shopDomain" value={shopDomain} error={this.shopDomainError} readOnly={false}
                       label="Shopify store's name:"
                       helpText={shopDomain ? "Shop domain: " + this.shopDomain : ''}
                       placeholder="my-store-name.myshopify.com"
                       disabled={this.hasShopDomain || sending}
                       onChange={this.handleChangeShopDomain}/>
        )
    }

    renderForgotPasswordCode() {
        let { forgotPassword, forgotPasswordCode, forgotPasswordCodeError, sending } = this.state;

        if ( !forgotPassword ) return;

        return (
            <TextField type="test" id="forgotPasswordCode" value={forgotPasswordCode} error={forgotPasswordCodeError}
                       readOnly={false}
                       label="Enter your forgot password code:"
                       disabled={sending}
                       onChange={this.handleChangeCommonField}/>
        )
    }

    renderCurrentPasswordField() {
        let { changeCurrentPassword, currentPasswordError, currentPassword, sending } = this.state;

        if ( !changeCurrentPassword ) return;

        return (
            <TextField type="password" id="currentPassword" value={currentPassword} error={currentPasswordError}
                       readOnly={false}
                       label="Enter your current password:"
                       disabled={sending}
                       onChange={this.handleChangeCommonField}/>
        )
    }

    renderPassword1Field() {
        let { changeCurrentPassword, forgotPassword } = this.state;

        if ( !this.hasShopDomain || !this.isAuthorized || this.isAuthenticated && !changeCurrentPassword ) return;

        let { password1, sending } = this.state,
            helpText = this.isRegistered && !changeCurrentPassword ? null : 'Must contain at least 8 characters, lowercase, uppercase, numbers and special characters';

        return (
            <TextField type="password" id="password1" value={password1} error={this.password1Error} readOnly={false}
                       label={forgotPassword || changeCurrentPassword ? "Enter your new password:" : "Enter your password:"}
                       helpText={helpText}
                       disabled={sending}
                       onChange={this.handleChangePassword}/>
        )
    }

    renderPassword2Field() {
        let { forgotPassword, changeCurrentPassword } = this.state;

        if ( !this.isAuthorized || this.isRegistered && !forgotPassword && !changeCurrentPassword ) return;

        let { password2, sending } = this.state;

        return (
            <TextField type="password" id="password2" value={password2} error={this.password2Error} readOnly={false}
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

                <Card sectioned title={this.title} actions={this.headerActions}
                      primaryFooterAction={this.primaryFooterAction}
                      secondaryFooterAction={this.secondaryFooterAction}>
                    <FormLayout>
                        {this.renderCurrentShopDomain()}
                        {this.renderShopDomainField()}
                        {this.renderForgotPasswordCode()}
                        {this.renderCurrentPasswordField()}
                        {this.renderPassword1Field()}
                        {this.renderPassword2Field()}
                    </FormLayout>
                </Card>
            </div>
        );
    }
}
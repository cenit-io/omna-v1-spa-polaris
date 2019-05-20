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
        this.state.newPassword = null;
        this.state.confirmPassword = null;
        this.state.forgotPasswordCode = null;
        this.state.forgotPasswordEmail = null;

        this.state.forgotPassword = false;
        this.state.changeCurrentPassword = false;
    }

    handleChangeShopDomain = (value) => this.setState({ shopDomain: value.replace(/\.myshopify\.com$/, '') });

    handleChangeCommonField = (value, field) => {
        this.setState((prevState) => {
            prevState[field] = value;
            prevState[field + 'Error'] = !value ? 'Required' : null;
            return prevState;
        });
    };

    handleChangePassword = (value, field) => this.setState((prevState) => {
        prevState[field] = value;
        return prevState;
    });

    handleCheckShopDomain = () => {
        this.setState({ sending: true });
        Utils.loadSettings({ shop: this.shopDomain, force_new_session: true }).then((settings) => {
            let notifications;

            this.appSettings = settings;

            if ( !this.isAuthorized ) {
                notifications = [{ status: 'warning', message: 'The OMNA application is not installed in this store.' }]
            } else if ( !this.isRegistered ) {
                notifications = [{
                    status: 'warning', message: 'You have never logged in, please set and confirm your password.'
                }]
            }

            this.setState({ sending: false, notifications: notifications });
        }).catch((error) => {
            this.setState({ sending: false, notifications: [{ status: 'error', message: error }] });
        })
    };

    handleInstall = () => window.open(this.appSettings.authorize_uri, '_parent');

    handleSignUp = () => this.signActionRequest('sign_up');

    handleSignIn = () => this.signActionRequest('sign_in');

    handleResetPassword = () => this.signActionRequest('reset_password');

    handleChangeCurrentPassword = () => this.signActionRequest('change_current_password');

    handleSignOut = () => this.signActionRequest('sign_out').done((response) => {
        Utils.renderPage('home', null, response.settings);
        this.resetState()
    });

    handleCancel = () => {
        if ( !this.isAuthenticated && !this.state.forgotPassword ) this.appSettings = {};
        this.resetState()
    };

    handleActiveForgotPassword = () => {
        this.signActionRequest('sign_forgot_password').done((response) => {
            Utils.renderPage('home', null, response.settings);
            this.setState({
                forgotPassword: true,
                forgotPasswordEmail: 'Check email ( ' + response.email + ' ) to get this code.'
            });
        });
    };

    handleActiveChangeCurrentPassword = () => this.resetState({ changeCurrentPassword: true });

    processFailRequest = (response) => this.setState({
        sending: false,
        notifications: [{
            status: 'critical',
            message: Utils.parseResponseError(response),
            field: response.responseJSON ? response.responseJSON.field : null
        }]
    });

    signActionRequest(action) {
        let data = { shop: this.shopDomain };

        if ( action === 'sign_up' ) {
            data.new_password = this.newPasswordEncoded
        } else if ( action === 'sign_in' ) {
            data.current_password = this.currentPasswordEncoded
        } else if ( action === 'change_current_password' ) {
            action = 'sign_up';
            data.current_password = this.currentPasswordEncoded;
            data.new_password = this.newPasswordEncoded;
        } else if ( action === 'reset_password' ) {
            action = 'sign_up';
            data.forgot_password_code = this.state.forgotPasswordCode;
            data.new_password = this.newPasswordEncoded;
        }

        this.setState({ sending: true });
        return $.post({
            url: this.urlTo(action),
            data: this.requestParams(data),
            xhrFields: { withCredentials: true },
            dataType: 'json',
        }).done((response) => {
            Utils.renderPage('home', null, response.settings);
            this.setState({ sending: false, forgotPassword: false, changeCurrentPassword: false, notifications: null });
        }).fail(this.processFailRequest)
    }

    resetState(state) {
        let { changeCurrentPassword, forgotPassword, shopDomain } = this.state;

        this.setState($.extend({
                sending: false,
                shopDomain: (changeCurrentPassword || forgotPassword) ? shopDomain : null,

                currentPassword: null,
                newPassword: null,
                confirmPassword: null,
                forgotPasswordCode: null,

                forgotPassword: false,
                changeCurrentPassword: false,

                notifications: null,
            }, state)
        );
    }

    get forgotPasswordCodeError() {
        return (this.state.forgotPasswordCode === '') ? 'Required' : false
    }

    get currentPasswordError() {
        return (this.state.currentPassword === '') ? 'Required' : false
    }

    get newPasswordError() {
        // ^	                            The password string will start this way
        // (?=.*[a-zñáéíóú])	            The string must contain at least 1 lowercase alphabetical character
        // (?=.*[A-ZÑÁÉÍÓÚ])	            The string must contain at least 1 uppercase alphabetical character
        // (?=.*[0-9])	                    The string must contain at least 1 numeric character
        // (?=.*[^a-zñáéíóúA-ZÑÁÉÍÓÚ0-9])	The string must contain at least one special character
        // (?=.{8,})	                    The string must be eight characters or longer

        let { changeCurrentPassword, forgotPassword, newPassword } = this.state,
            needValidation = (newPassword !== null) && (!this.isRegistered || forgotPassword || changeCurrentPassword),
            validatorRegExp = /^(?=.*[a-zñáéíóú])(?=.*[A-ZÑÁÉÍÓÚ])(?=.*[0-9])(?=.*[^a-zñáéíóúA-ZÑÁÉÍÓÚ0-9])(?=.{8,})/;

        return (needValidation && !newPassword.match(validatorRegExp)) ? 'Invalid password.' : false;
    };

    get shopDomainError() {
        let { shopDomain } = this.state,
            validatorRegExp = /^([\wñáéíóú]+([\-.][\wñáéíóú])?)+(\.myshopify\.com)?$/i;

        return shopDomain !== null && !this.shopDomain.match(validatorRegExp) ? 'Invalid store name.' : false;
    };

    get confirmPasswordError() {
        let { changeCurrentPassword, forgotPassword, newPassword, confirmPassword } = this.state,
            needValidation = (confirmPassword !== null) && (!this.isRegistered || forgotPassword || changeCurrentPassword);

        return needValidation && newPassword !== confirmPassword ? 'Not match.' : false
    };

    get newPasswordEncoded() {
        let str1 = [...Base64.encode(this.state.newPassword)].reverse(),
            str2 = [...this.appSettings.one_way_token];

        return Base64.encode(str1.map((c, i) => c + str2[i % str2.length]).join(''))
    }

    get currentPasswordEncoded() {
        let password = sha256.hmac.update(this.shopDomain, this.state.currentPassword).hex();

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
        let { changeCurrentPassword, forgotPassword, sending } = this.state,
            actions = [];

        if ( this.isAuthenticated ) {
            changeCurrentPassword || actions.push({
                content: 'Change password', onAction: this.handleActiveChangeCurrentPassword
            });
        } else if ( this.isAuthorized ) {
            forgotPassword || actions.push({
                content: 'Forgot password', onAction: this.handleActiveForgotPassword, disabled: sending
            });
        }

        return actions
    }

    get primaryFooterAction() {
        let { shopDomain, newPassword, confirmPassword, currentPassword, changeCurrentPassword, forgotPassword, forgotPasswordCode } = this.state,

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
            valid = newPassword && confirmPassword && !this.newPasswordError && !this.confirmPasswordError
        } else if ( forgotPassword ) {
            content = 'Reset password';
            handleAction = this.handleResetPassword;
            valid = forgotPasswordCode && newPassword && confirmPassword && !this.newPasswordError && !this.confirmPasswordError
        } else if ( changeCurrentPassword ) {
            content = 'Change password';
            handleAction = this.handleChangeCurrentPassword;
            valid = currentPassword && newPassword && confirmPassword && !this.newPasswordError && !this.confirmPasswordError
        } else if ( !this.isAuthenticated ) {
            handleAction = this.handleSignIn;
            valid = !!currentPassword
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

    notificationFieldError(field) {
        let { notifications } = this.state;

        if ( notifications && notifications[0] && notifications[0].field === field ) return true;
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
        let { forgotPassword, forgotPasswordCode, forgotPasswordEmail, sending } = this.state;

        if ( !forgotPassword ) return;

        return (
            <TextField type="test" id="forgotPasswordCode" value={forgotPasswordCode}
                       error={this.forgotPasswordCodeError || this.notificationFieldError('forgot_password_code')}
                       helpText={forgotPasswordEmail}
                       readOnly={false}
                       label="Enter your forgot password code:"
                       disabled={sending}
                       onChange={this.handleChangeCommonField}/>
        )
    }

    renderCurrentPasswordField() {
        let { changeCurrentPassword, forgotPassword, currentPassword, sending } = this.state;

        if ( this.isRegistered && !forgotPassword && (!this.isAuthenticated || changeCurrentPassword) ) return (
            <TextField type="password" id="currentPassword" value={currentPassword}
                       error={this.currentPasswordError || this.notificationFieldError('current_password')}
                       readOnly={false}
                       label="Enter your current password:"
                       disabled={sending}
                       onChange={this.handleChangeCommonField}/>
        )
    }

    renderNewPasswordField() {
        let { changeCurrentPassword, forgotPassword } = this.state;

        if ( !this.hasShopDomain || !this.isAuthorized || this.isRegistered && !forgotPassword && !changeCurrentPassword ) return;

        let { newPassword, sending } = this.state;

        return (
            <TextField type="password" id="newPassword" value={newPassword}
                       error={this.newPasswordError || this.notificationFieldError('new_password')}
                       readOnly={false}
                       label="Enter your new password:"
                       helpText="Must contain at least 8 characters, lowercase, uppercase, numbers and special characters"
                       disabled={sending}
                       onChange={this.handleChangePassword}/>
        )
    }

    renderConfirmPasswordField() {
        let { changeCurrentPassword, forgotPassword } = this.state;

        if ( !this.hasShopDomain || !this.isAuthorized || this.isRegistered && !forgotPassword && !changeCurrentPassword ) return;

        let { confirmPassword, sending } = this.state;

        return (
            <TextField type="password" id="confirmPassword" value={confirmPassword} error={this.confirmPasswordError}
                       readOnly={false}
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
        if ( this.isInstalling || Utils.inIframe ) return;

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
                        {this.renderNewPasswordField()}
                        {this.renderConfirmPasswordField()}
                    </FormLayout>
                </Card>
            </div>
        );
    }
}
import React, {Component} from 'react';
import {
    Page,
    Card,
    Tabs,
    DisplayText,
    Banner,
    Spinner,
    FormLayout,
    TextField,
    AccountConnection,
    Link
} from '@shopify/polaris';

export class OMNAComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.handleUninstall = this.handleUninstall.bind(this);
    }

    getValue(attr, scope) {
        var value, attrs = attr.split('.');

        attr = attrs.shift();
        value = (typeof scope == 'undefined') ? this.state[attr] : scope[attr];
        value = (typeof value == 'undefined') ? window[attr] : value;
        value = (attrs.length > 0 && typeof value != 'undefined') ? this.getValue(attrs.join('.'), value) : value;

        return value;
    }

    getSessionItem(name, defaultValue) {
        var item = window.sessionStorage.getItem(name);
        return (item === null) ? defaultValue : JSON.parse(item);
    }

    setSessionItem(name, value) {
        window.sessionStorage.setItem(name, JSON.stringify(value));
    }

    requestParams(data) {
        const baseParams = this.getValue('OMNA.settings.URIs.base_params');

        data = data || {};

        return $.extend({}, data, baseParams);
    }

    queryParams(data) {
        return $.param(this.requestParams(data));
    }

    urlTo(path) {
        const basePath = this.getValue('OMNA.settings.URIs.base_path');

        return (basePath + '/' + path.replace(/^\//, '')).replace(/\/\?/, '?');
    }

    isInstalling() {
        return this.getValue('OMNA.settings.status') == 'installing';
    }

    isInactive() {
        return this.getValue('OMNA.settings.plan.status') != 'active';
    }

    handleUninstall(e) {
        e.preventDefault();
        open('https://' + this.getValue('OMNA.settings.URIs.base_params.shop') + '/admin/apps', '_parent')
    }

    renderInstalling() {
        this.loadingOn();

        setTimeout(() => window.location.reload(), 30000);

        return <Card>{this.warn('Please wait while the installation process is complete.')}</Card>;
    }

    renderGoToSetup(nextAction) {
        return (
            <p>
                {'Kindly go to '}<Link onClick={() => OMNA.render('setup')}><b>Setup / OMNA</b></Link>
                {' and click '}{nextAction}{' to the application and billing.'}
            </p>
        );
    }

    renderGoToUninstall() {
        return (
            <p>
                To remove the application, kindly head over to your{' '}
                <Link onClick={this.handleUninstall}><b>Shopify Dashboard Apps</b></Link> and click the trash.
            </p>
        )
    }

    renderInactive() {
        if ( this.isInactive() ) {
            const status = this.getValue('OMNA.settings.plan.status');

            var nextAction = false;

            if ( status == 'cancelled' || status == 'declined' ) {
                nextAction = 'Activate'
            } else if ( status == 'pending' ) {
                nextAction = 'Confirm'
            }

            return (
                <Card>
                    {this.warn('The application is disabled because the OMNA plan status is ' + status + '.')}
                    {
                        nextAction && this.info(
                            <div>
                                {this.renderGoToSetup(<b>{nextAction}</b>)}
                                {this.renderGoToUninstall()}
                            </div>
                        )
                    }
                </Card>
            );
        }
    }

    renderLoading(title) {
        return <Card sectioned title={title || 'Loading...'}><Spinner size="large" color="teal"/></Card>;
    }

    renderHelpLink(title, url) {
        return <Link url={url} external={true}>{title}</Link>
    }

    renderNotification(title, content, status) {
        status = status || 'info';
        content = content || title;
        title = (content == title) ? null : title;

        return (<Banner title={title} status={status}>{content}</Banner>)
    }

    renderNotifications(notifications) {
        if ( notifications ) {
            return notifications.map(
                (item, idx) => <div key={idx}>{this.renderNotification(null, item.message, item.status)}</div>
            );
        }
    }

    info(title, content) {
        return this.renderNotification(title, content, 'info')
    }

    warn(title, content) {
        return this.renderNotification(title, content, 'warning')
    }

    error(title, content) {
        return this.renderNotification(title, content, 'critical')
    }

    success(title, content) {
        return this.renderNotification(title, content, 'success')
    }

    flashError(msg) {
        (typeof ShopifyApp != 'undefined') && ShopifyApp.flashError(msg) || console.error(msg);
    }

    flashNotice(msg) {
        (typeof ShopifyApp != 'undefined') && ShopifyApp.flashNotice(msg) || console.info(msg);
    }

    loadingOn() {
        (typeof ShopifyApp != 'undefined') && ShopifyApp.Bar.loadingOn();
    }

    loadingOff() {
        (typeof ShopifyApp != 'undefined') && ShopifyApp.Bar.loadingOff();
    }

    confirm(msg, callback) {
        (typeof ShopifyApp != 'undefined') ? ShopifyApp.Modal.confirm(msg, callback) : callback(window.confirm(msg));
    }

    variants(product, includeDefault) {
        return includeDefault ? product.variants : product.variants.filter((v) => v.title != 'Default Title');
    }

    defaultVariant(product) {
        return product.variants[0]
    }

    images(item) {
        const { images } = item;

        var imgs = (images || []).map(function (img) {
            return { original: img.src, small: img.src.replace(/\.([^\.]+$)/, "_small.$1") }
        });

        (item.variants || []).forEach(function (v) {
            imgs = imgs.concat(this.images(v))
        }.bind(this));

        return imgs;
    }

    defaultImage(item) {
        return this.images(item)[0]
    }
}

export class OMNAPage extends OMNAComponent {
    constructor(props) {
        super(props);
        this.state.title = 'OMNA for Shopify';
        this.state.subTitle = 'Sell Anywhere, Manage On One';
    }

    renderTitle() {
        const { title, subTitle } = this.state;

        return (
            <div>
                <DisplayText size="medium">{title}</DisplayText>
                <DisplayText size="small">{subTitle}</DisplayText>
            </div>
        )
    }

    renderActions() {
        const { OMNA } = window;

        if ( OMNA.settings ) {
            if ( this.isInstalling() ) return this.renderInstalling();

            if ( typeof ShopifyApp != 'undefined' && !OMNA.alreadyInitialize ) {

                OMNA.alreadyInitialize = true;

                ShopifyApp.Bar.initialize({
                    icon: this.urlTo('static/omna_logo_icon_16x16.png'),
                    buttons: {
                        secondary: [
                            {
                                label: 'Support',
                                href: 'https://omna.zendesk.com/hc/en-us/categories/360000251632-OMNA-For-Shopify',
                                target: 'new'
                            },
                            {
                                label: 'Home',
                                callback: function () {
                                    OMNA.render('home');
                                }
                            },
                            {
                                label: 'Products',
                                disabled: this.isInactive(),
                                callback: function () {
                                    OMNA.render('products');
                                }
                            },
                            {
                                label: 'Setup',
                                callback: function () {
                                    OMNA.render('setup');
                                }
                            }
                        ]
                    }
                });
            }

            if ( this.isInactive() ) return this.renderInactive();
        }
    }

    renderInstall() {
        const { OMNA } = window;

        if ( OMNA.settings == undefined || OMNA.settings == false ) {
            const
                { shopDomain, shopDomainError } = this.state,

                termsOfService = (
                    <FormLayout>
                        <TextField label="Enter your store's domain:" value={shopDomain} error={shopDomainError}
                                   placeholder="my-store-name.myshopify.com"
                                   onChange={this.handleChangeshopDomain}/>
                    </FormLayout>
                );

            return (
                <AccountConnection
                    title="Install OMNA application in your Shopify store."
                    termsOfService={termsOfService}
                    action={{
                        content: 'Install',
                        onAction: this.handleInstall,
                        disabled: shopDomain == '' || shopDomainError
                    }}
                />
            );
        }
    }

    renderUnconnected() {
        return !this.getValue('OMNA.settings.shop_configured') ? this.warn('This application is not yet connected with OMNA services.') : null
    }
}

export class TabsPage extends OMNAPage {
    constructor(props) {
        super(props);
        this.state = { selectedTabIndex: this.props.selectedTabIndex || 0, notifications: [] };
        this.getSectionTitle = this.getSectionTitle.bind(this)
    }

    handleTabChange(selectedTabIndex) {
        const tabs = this.tabs();

        this.setState({
            selectedTabIndex: selectedTabIndex
        });
    }

    getSectionTitle(tab) {
        return null;
    }

    render() {
        const
            sIdx = this.state.selectedTabIndex,
            tabs = this.tabs();

        return (
            <Page title={this.renderTitle()} separator={true}>
                {this.renderNotifications(this.state.notifications)}
                {this.renderActions()}

                <Card sectioned>
                    <Tabs tabs={tabs} selected={sIdx} onSelect={this.handleTabChange.bind(this)}/>
                    <Card.Section title={this.getSectionTitle(tabs[sIdx])}>
                        {tabs[sIdx].body}
                    </Card.Section>
                </Card>
            </Page>
        );
    }
}
import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import {Card, Banner, Link, Spinner} from '@shopify/polaris';
import {AppContext} from './AppContext'

export class OMNAComponent extends Component {

    constructor(props) {
        super(props);
        this.state = { appContext: {} };
        this.handleUninstall = this.handleUninstall.bind(this);
    }

    static get contextTypes() {
        return { polaris: PropTypes.any, easdk: PropTypes.object };
    }

    countryName(acronym) {
        switch ( acronym ) {
            case 'SG':
                return 'Singapore';
            case 'MY':
                return 'Malaysia';
            case 'ID':
                return 'Indonesia';
            case 'TH':
                return 'Thailand';
            case 'PH':
                return 'Philippines';
            case 'VN':
                return 'Vietnam';
            default:
                return acronym
        }
    }

    countryDomain(acronym) {
        switch ( acronym ) {
            case 'SG':
                return 'sg';
            case 'MY':
                return 'com.my';
            case 'ID':
                return 'co.id';
            case 'TH':
                return 'co.th';
            case 'PH':
                return 'com.ph';
            case 'VN':
                return 'vn';
            default:
                return 'com';
        }
    }

    getSessionItem(name, defaultValue) {
        const item = window.sessionStorage.getItem(name);

        return (item === null) ? defaultValue : JSON.parse(item);
    }

    setSessionItem(name, value) {
        window.sessionStorage.setItem(name, JSON.stringify(value));
    }

    setProduct(product) {
        const productItems = this.productItems;

        productItems.items[this.getProductIndex(product)] = product;

        this.productItems = productItems;
    }

    get productItems() {
        return this.getSessionItem('products-items') || {
            items: [], count: 0, page: 0, pages: 0, searchTerm: '', filters: []
        };
    }

    set productItems(data) {
        return this.setSessionItem('products-items', data);
    }

    getProductIndex(product) {
        return this.productItems.items.findIndex((item) => item.ecommerce_id === product.ecommerce_id);
    }

    requestParams(data) {
        data = data || {};

        return $.extend({}, data, this.state.appContext.settings.URIs.base_params);
    }

    queryParams(data) {
        return $.param(this.requestParams(data));
    }

    urlTo(path) {
        return (this.state.appContext.settings.URIs.base_path + '/' + path.replace(/^\//, '')).replace(/\/\?/, '?');
    }

    get isInactive() {
        return this.state.appContext.settings.plan.status != 'active';
    }

    chunkArray(array, chunkSize) {
        let idx = 0,
            l = array.length,
            tempArray = [];

        for ( idx = 0; idx < l; idx += chunkSize ) {
            myChunk = array.slice(idx, idx + chunkSize);
            tempArray.push(myChunk);
        }

        return tempArray;
    }

    get activeChannels() {
        const { channels } = this.state.appContext.settings;
        let aChannels = [];

        Object.keys(channels).forEach((i) => channels[i].connected && aChannels.push(channels[i]));

        return aChannels
    }

    get channels() {
        return this.state.appContext.settings.channels
    }

    channelName(channel, short, withoutNotes) {
        channel = typeof channel === 'string' ? this.channels[channel] : channel;

        let cName = channel.name.replace(/^(.*[^A-Z])([A-Z]+)$/, (name, prefix, acronym) => {
            return (short ? '' : prefix + '-') + this.countryName(acronym)
        });

        return withoutNotes ? cName : (
            <span className="channel-name">
                {cName}
                {channel.deprecated && <span className="speech deprecate">DEPRECATE</span>}
                {channel.beta && <span className="speech beta">BETA</span>}
            </span>
        )
    }

    handleUninstall(e) {
        e.preventDefault();
        open('https://' + this.state.appContext.settings.URIs.base_params.shop + '/admin/apps', '_parent')
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

    renderLoading(title) {
        return <Card sectioned title={title || 'Loading...'}><Spinner size="large" color="teal"/></Card>;
    }

    renderExternalLink(title, url, onClick = null) {
        return <Link url={url} external={true} onClick={onClick}>{title}</Link>
    }

    renderNotification(title, content, status) {
        status = status || 'info';
        content = content || title;
        title = (content === title) ? null : title;

        return (<Banner title={title} status={status}>{content}</Banner>)
    }

    renderNotifications(notifications) {
        if ( notifications ) {
            return notifications.map(
                (item, idx) => <Card key={idx}>{this.renderNotification(null, item.message, item.status)}</Card>
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
        this.context.easdk && this.context.easdk.showFlashNotice(msg, { error: true }) || console.error(msg);
    }

    flashNotice(msg) {
        this.context.easdk && this.context.easdk.showFlashNotice(msg, { error: false }) || console.info(msg);
    }

    loadingOn() {
        this.context.easdk && this.context.easdk.startLoading() || console.info('LOADING-ON');
    }

    loadingOff() {
        this.context.easdk && this.context.easdk.stopLoading() || console.info('LOADING-OFF');
    }

    confirm(msg, callback) {
        callback(window.confirm(msg));
    }

    variants(product, includeDefault) {
        return includeDefault ? product.variants : product.variants.filter((v) => v.title != 'Default Title');
    }

    images(item) {
        const { images } = item;

        var imgs = (images || []).map((img) => {
            return { original: img.src, small: img.src.replace(/\.([^\.]+$)/, "_small.$1") }
        });

        (item.variants || []).forEach((v) => imgs = imgs.concat(this.images(v)));

        return imgs;
    }

    defaultImage(item) {
        return this.images(item)[0]
    }

    renderWithAppContext(appContext) {
        return '...'
    }

    render() {
        return (
            <AppContext.Consumer>
                {
                    (appContext) => {
                        this.state.appContext = appContext;
                        return this.renderWithAppContext(appContext)
                    }
                }
            </AppContext.Consumer>
        );
    }

    componentWillUnmount() {
        this.abortPreviousTask()
    }

    abortPreviousTask() {
        if ( this.timeoutHandle ) clearTimeout(this.timeoutHandle);
        if ( this.xhr && this.xhr.readyState != 4 ) this.xhr.abort();
    }
}

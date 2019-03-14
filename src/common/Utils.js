import React from 'react';
import {Card, Banner, Link, Spinner} from '@shopify/polaris';
import LZString from 'lz-string'

export class Utils {


    static countryName(acronym) {
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

    static countryDomain(acronym) {
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

    static getSessionItem(name, defaultValue) {
        const item = window.sessionStorage.getItem(name);

        return (item === null) ? defaultValue : JSON.parse(LZString.decompress(item));
    }

    static setSessionItem(name, value) {
        try {
            window.sessionStorage.setItem(name, LZString.compress(JSON.stringify(value)))
        } catch ( e ) {
            window.sessionStorage.clear()
        }
    }

    static delSessionItem(name) {
        window.sessionStorage.removeItem(name)
    }

    static renderGoToSetup(nextAction) {
        return (
            <p>
                {'Kindly go to '}<Link onClick={() => OMNA.render('setup')}><b>Setup / OMNA</b></Link>
                {' and click '}{nextAction}{' to the application and billing.'}
            </p>
        );
    }

    static renderGoToUninstall() {
        return (
            <p>
                To remove the application, kindly head over to your{' '}
                <Link onClick={this.handleUninstall}><b>Shopify Dashboard Apps</b></Link> and click the trash.
            </p>
        )
    }

    static renderLoading(title) {
        return <Card sectioned title={title || 'Loading...'}><Spinner size="large" color="teal"/></Card>;
    }

    static renderExternalLink(title, url, onClick = null) {
        return <Link url={url} external={true} onClick={onClick}>{title}</Link>
    }

    static renderNotification(title, content, status) {
        status = status || 'info';
        content = content || title;
        title = (content === title) ? null : title;

        return (<Banner title={title} status={status}>{content}</Banner>)
    }

    static renderNotifications(notifications) {
        if ( notifications ) {
            return notifications.map(
                (item, idx) => <Card key={idx}>{Utils.renderNotification(null, item.message, item.status)}</Card>
            );
        }
    }

    static info(title, content) {
        return Utils.renderNotification(title, content, 'info')
    }

    static warn(title, content) {
        return Utils.renderNotification(title, content, 'warning')
    }

    static error(title, content) {
        return Utils.renderNotification(title, content, 'critical')
    }

    static success(title, content) {
        return Utils.renderNotification(title, content, 'success')
    }

    static confirm(msg, callback) {
        callback(window.confirm(msg));
    }


    static get productItems() {
        return Utils.getSessionItem('products-items') || {
            items: [], count: 0, page: 0, pages: 0, searchTerm: '', filters: []
        };
    }

    static set productItems(data) {
        return Utils.setSessionItem('products-items', data);
    }

    static getProductIndex(product) {
        return Utils.productItems.items.findIndex((item) => item.ecommerce_id === product.ecommerce_id);
    }

    static productCategoryAttr(channel) {
        let match = (regexp) => (channel.match(regexp) || {}).input;

        switch ( channel ) {
            case match(/^Lazada/):
                return 'primary_category';
            case match(/^Qoo10/):
                return 'SecondSubCat';
            case match(/^Shopee/):
                return 'category_id';
            default:
                return 'variants';
        }
    }

    static productVariantsAttr(channel) {
        let match = (regexp) => (channel.match(regexp) || {}).input;

        switch ( channel ) {
            case match(/^Lazada/):
                return 'Skus';
            case match(/^Qoo10/):
                return 'SecondSubCat';
            case match(/^Shopee/):
                return 'category_id';
            default:
                return 'category_id';
        }
    }

    static variants(product, includeDefault) {
        return includeDefault ? product.variants : product.variants.filter((v) => v.title != 'Default Title');
    }

    static images(item) {
        const { images } = item;

        var imgs = (images || []).map((img) => {
            return { original: img.src, small: img.src.replace(/\.([^\.]+$)/, "_small.$1") }
        });

        (item.variants || []).forEach((v) => imgs = imgs.concat(Utils.images(v)));

        return imgs;
    }

    static defaultImage(item) {
        return Utils.images(item)[0]
    }

    static productCategories(channel, scope) {
        let id = 'categories-' + channel,
            data = Utils.getSessionItem(id);

        if ( !data && !scope.state.loadingProductCategories ) {
            scope.setState({ loadingProductCategories: true });
            scope.loadingOn();
            scope.xhr = $.getJSON({
                url: scope.urlTo('nomenclatures'),
                data: scope.requestParams({
                    entity: 'Category', sch: channel, idAttr: 'category_id', textAttr: 'name', q: { ps: 10000 }
                })
            }).done((response) => {
                Utils.setSessionItem(id, data = response);
            }).fail((response) => {
                const msg = 'Failed to load ' + channel + ' categories. ' + response.responseJSON.error;
                scope.flashError(msg);
            }).always(() => {
                scope.setState({ loadingProductCategories: false });
                scope.loadingOff();
            });
        }

        return data || { items: [] };
    }
}

import React from 'react';
import {Card, Banner, Link, Spinner, FormLayout} from '@shopify/polaris';
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

    static status(state) {
        switch ( state ) {
            case 'complete':
                return 'success';
            case 'pending':
                return 'info';
            case 'canceled':
                return 'warning';
            case 'fulfilled':
                return 'success';
            case 'unfulfilled':
                return 'attention';
            default:
                return 'default';
        }
    }

    static progress(state) {
            switch ( state ) {
                case 'complete':
                    return 'complete';
                case 'completed':
                    return 'complete';
                case 'canceled':
                    return 'incomplete';
                default:
                    return 'partiallyComplete';
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

    static renderLoading(size, title) {
        if ( !title && size && size.match(/^large|small$/) ) return <Spinner size={size} color="teal"/>;

        if ( !title ) {
            title = size;
            size = 'large'
        }

        return <Card sectioned title={title || 'Loading...'}><Spinner size={size} color="teal"/></Card>;
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
        window.productItems = window.productItems || Utils.getSessionItem('products-items') || {
            items: [], count: 0, page: 0, pages: 0, searchTerm: '', filters: [], sort: ''
        };

        return window.productItems
    }

    static set productItems(data) {
        window.productItems = data;
        Utils.setSessionItem('products-items', data);
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
                return 'category_id';
        }
    }

    static productVariantsAttr(channel) {
        let match = (regexp) => (channel.match(regexp) || {}).input;

        switch ( channel ) {
            case match(/^Lazada/):
                return 'Skus';
            case match(/^(Qoo10|Shopee)/):
                return 'variants';
            default:
                return 'variants';
        }
    }

    static parseResponseError(response) {
        if ( response.responseJSON ) return response.responseJSON.error || response.responseJSON;

        return '(' + response.state() + ')'
    }

    static waitResponse(id, callback) {
        window.waitingResponse = window.waitingResponse || {};
        window.waitingResponse[id] = window.waitingResponse[id] || [];
        window.waitingResponse[id].push(callback);
    }

    static releaseWaitResponse(id, response) {
        if ( window.waitingResponse && window.waitingResponse[id] ) {
            window.waitingResponse[id].forEach((callback) => callback(response))
            window.waitingResponse[id] = null;
            delete window.waitingResponse[id];
        }
    }

    static isWaitingResponse(id) {
        return window.waitingResponse && window.waitingResponse[id]
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
        let sessionId = 'categories-' + channel,
            data = Utils.getSessionItem(sessionId);

        if ( !data && !scope.state.loadingProductCategories ) {
            scope.setState({ loadingProductCategories: true });
            scope.loadingOn();
            scope.xhr = $.getJSON({
                url: scope.urlTo('nomenclatures'),
                data: scope.requestParams({
                    entity: 'Category', sch: channel, idAttr: 'category_id', textAttr: 'name', q: { ps: 10000 }
                })
            }).done((response) => {
                Utils.setSessionItem(sessionId, data = response);
            }).fail((response) => {
                const msg = 'Failed to load ' + channel + ' categories. ' + Utils.parseResponseError(response);
                scope.flashError(msg);
            }).always(() => {
                scope.setState({ loadingProductCategories: false });
                scope.loadingOff();
            });
        }

        return data || { items: [] };
    }

    static getPropertiesDefinitions(channel) {
        return Utils.getSessionItem('propertiesDefinitions', {})[channel] || {}
    }

    static setPropertiesDefinitions(channel, value) {
        let pds = Utils.getSessionItem('propertiesDefinitions', {});

        pds[channel] = value;

        Utils.setSessionItem('propertiesDefinitions', pds)
    }

    static getPropertiesDefinition(channel, category) {
        return Utils.getPropertiesDefinitions(channel)[category];
    }

    static setPropertiesDefinition(channel, category, value) {
        const pds = Utils.getPropertiesDefinitions(channel);

        value.accessAt = Date.now();

        pds[category] = value;

        { // Save properties definitions of only 5 categories.
            const keys = Object.keys(pds);

            if ( keys.length > 5 ) {
                var k1 = keys.shift();

                keys.forEach((k2) => k1 = (pds[k1].accessAt > pds[k2].accessAt) ? k2 : k1);

                delete pds[k1];
            }
        }

        Utils.setPropertiesDefinitions(channel, pds);
    }

    static groupProperties(propertiesDefinition, size) {
        let currentType, currentTypeSize,
            currentGroup, currentGroupSize = 0,
            groups = [];

        size = size || {};
        size.max = size.max || 2;
        size.rich_text = size.rich_text || size.max;
        size.multi_select = size.multi_select || size.max;

        propertiesDefinition.forEach((pd) => {
            currentGroup = groups[groups.length - 1];
            currentType = pd.type || 'text';
            currentTypeSize = size[currentType] || 1;

            if ( !currentGroup || currentGroupSize + currentTypeSize > size.max ) {
                groups.push([pd]);
                currentGroupSize = currentTypeSize
            } else {
                currentGroup.push(pd);
                currentGroupSize += currentTypeSize;
            }
        });

        return groups;
    }

    static loadPropertiesDefinition(channel, categoryId, scope) {
        let item = Utils.getPropertiesDefinition(channel, categoryId),
            waitingId = channel + categoryId;

        if ( !item ) {
            if ( !Utils.isWaitingResponse(waitingId) ) {
                scope.loadingOn();
                scope.xhr = $.getJSON({
                    url: scope.urlTo('properties'),
                    data: scope.requestParams({ sch: channel, category_id: categoryId })
                }).done((response) => {
                    Utils.setPropertiesDefinition(channel, categoryId, response.properties);
                }).fail((response) => {
                    scope.flashError(
                        'Failed to load the properties for ' + channel + ' category. ' + Utils.parseResponseError(response)
                    );
                }).always((response) => {
                    scope.loadingOff();
                    Utils.releaseWaitResponse(waitingId, response);
                });
            }
            Utils.waitResponse(waitingId, (response) => scope.setState({ loading: false }));
        }

        return item || { product: [], variants: [] };
    }

    static loadNotifications(type, channel, resource_id, scope) {
        let data = { type: type || '-' };

        if ( channel ) data.channel = channel;
        if ( resource_id ) data.resource_id = resource_id;

        scope.loadingOn();
        scope.xhr = $.getJSON({
            url: scope.urlTo('notifications'),
            data: scope.requestParams(data)
        }).done((response) => {
            scope.setState({ notifications: response, notificationsLoaded: true })
        }).fail((response) => {
            const msg = 'Failed to load notifications. ' + Utils.parseResponseError(response);
            scope.flashError(msg);
        }).always(() => {
            scope.loadingOff();
        });
    }

    static renderPropertiesGroup(group, gIdx, item, store, renderPropertyField) {
        let title, context, items,
            prefixId = store + '_' + gIdx + '_';

        if ( !Array.isArray(group) ) {
            title = group.title;
            item = group.context ? item[group.context] : item;
            if ( Array.isArray(item) && group.allowAdd ) item.push({ __toAdd__: true });
            group = group.properties;
        }

        items = Array.isArray(item) ? item : [item];

        context = items.map((item, iIdx) => (
            <FormLayout.Group key={prefixId + iIdx}>
                {group.map((def, pIdx) => renderPropertyField(prefixId + iIdx + '_' + pIdx, def, item))}
            </FormLayout.Group>
        ));

        return title ? <Card sectioned title={title} key={gIdx}>{context}</Card> : context
    }

    static get orderItems() {
        window.orderItems = window.orderItems || Utils.getSessionItem('order-items') || {
            items: [], count: 0, page: 0, pages: 0, searchTerm: '', filters: [], sort: ''
        };

        return window.orderItems
    }

    static set orderItems(data) {
        window.orderItems = data;
        Utils.setSessionItem('orders-items', data);
    }
}
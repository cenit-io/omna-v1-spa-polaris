import React from 'react';
import {FilterType, Button, ButtonGroup} from '@shopify/polaris';
import {BlogMajorTwotone, SaveMinor, CancelSmallMinor} from '@shopify/polaris-icons';
import {Utils} from "../../common/Utils";
import {ResourceItemContext} from "../../common/ResourceItemContext";
import {AbstractList} from "../AbstractList";
import {ProductBulkPublishDlg} from "./ProductBulkPublishDlg";
import {ProductBulkSetCategoryDlg} from "./ProductBulkSetCategoryDlg";
import {ProductsListItemShow} from "./ProductsListItemShow";
import {ProductsListItemEditProperties} from "./ProductsListItemEditProperties";
import {ProductsListMenuBulkEditProperties as MenuBulkEditProperties} from "./ProductsListMenuBulkEditProperties";

export class ProductsList extends AbstractList {
    constructor(props) {
        super(props);
        this.state.title = 'Products';
        this.state.bulkPublishAction = false;
        this.state.bulkSetCategoryAction = false;
        this.state.sending = false;

        this.timeoutHandle = setTimeout(this.handleSearch, 0);
    }

    get resourceName() {
        return { singular: 'product', plural: 'products' }
    }

    get resourceUrl() {
        return this.urlTo('products')
    }

    get cache() {
        return Utils.productItems
    }

    set cache(value) {
        Utils.productItems = value
    }

    get filters() {
        let categoryFilterOptions = this.categoryFilterOptions,
            filters = [{
                key: 'sales_channels',
                label: 'Sales channels',
                operatorText: [
                    { key: 'with_channel', optionLabel: 'include' },
                    { key: 'without_channel', optionLabel: 'exnclude' }
                ],
                type: FilterType.Select,
                options: this.activeChannels.map((ac) => {
                    return { key: ac.name, value: ac.name, label: this.channelName(ac, false, true) }
                }),
            }];

        categoryFilterOptions && filters.push({
            key: 'category',
            label: 'Category',
            operatorText: 'is',
            type: FilterType.Select,
            options: categoryFilterOptions
        });

        return filters
    }

    get appliedFilters() {
        return super.appliedFilters
    }

    set appliedFilters(value) {
        let with_channels = value.filter((f) => f.key === 'with_channel');

        if ( with_channels.length !== 1 ) {
            value = value.filter((f) => f.key !== 'category')
        } else {
            Utils.productCategories(with_channels[0].value, this)
        }

        super.appliedFilters = value;
    }

    get isLoading() {
        return super.isLoading || this.state.loadingProductCategories
    }

    get categoryFilterOptions() {
        let channel = this.singleFilterValue('with_channel');

        if ( !channel ) return false;

        let options = Utils.productCategories(channel, this).items.map((c) => {
            let id = String(c.category_id);
            return { key: id, value: id, label: c.name }
        });
        options.unshift({ key: 'not defined', value: 'not defined', label: 'not defined' });

        return options
    }

    handleFastEdit = () => {
        this.setState({ fastEdit: true })
    };

    handleFastEditSave = () => {
        let products = this.cache.items.filter((product) => product['@isEdited']),
            lastIdx = products.length - 1,
            channel = this.singleFilterValue('with_channel'),
            uri = this.urlTo('product/update'),
            page = this.cache.page;

        products.forEach((product, idx) => {
            let sd = product['@storeDetails'],
                data = this.requestParams({ sch: channel, id: sd.ecommerce_id, product: sd });

            if ( !this.state.sending ) this.setState({ sending: true });
            this.xhr = $.post({
                url: uri,
                data: JSON.stringify(data),
                dataType: 'json',
                contentType: 'application/json',
                xhrFields: { withCredentials: true }
            }).done(() => {
                this.flashNotice('The product synchronization process with ' + channel + ' has been started');
            }).fail((response) => {
                this.processFailRequest(response, 'update');
            }).always(() => {
                if ( idx === lastIdx ) {
                    this.loadingOff();
                    this.setState({ fastEdit: false, sending: false });
                    this.cache = null;
                    this.handleSearch(page);
                }
            });
        });
    };

    handleFastEditCancel = () => {
        window.productItems = null;
        this.setState({ fastEdit: false })
    };

    handleBulkEditPropertyStateChange = () => {
        this.setState({ fastEdit: true })
    };

    processFailRequest(response, action) {
        let error = Utils.parseResponseError(response),
            channel = this.singleFilterValue('with_channel');

        error = error || '(' + response.state() + ')';

        this.flashError('Failed to ' + action + ' the product in ' + channel + ' sales channel. ' + error);
    }

    // handleBulkEditionData = () => {
    //     let { selectedItems, searchTerm } = this.state;
    //
    //     return this.requestParams({
    //         ids: selectedItems,
    //         term: searchTerm,
    //         filters: this.appliedFilters
    //     })
    // };

    handleBulkPublishAction = () => {
        this.setState({ bulkPublishAction: true })
    };

    handleBulkSetActegoryAction = () => {
        this.setState({ bulkSetCategoryAction: true })
    };

    handleSetCategoryFilter = (category) => {
        let appliedFilters = this.appliedFilters.filter((f) => f.key !== 'category');

        appliedFilters.push({ key: 'category', value: String(category.category_id) });
        this.handleFiltersChange(appliedFilters)
    };

    handleSetChannelFilter = (channel) => {
        let appliedFilters = this.appliedFilters;

        if ( !appliedFilters.find((f) => f.key === 'with_channel' && f.value === channel) ) {
            appliedFilters.push({ key: 'with_channel', value: channel });
            this.handleFiltersChange(appliedFilters)
        }
    };

    handleBulkDlgClose = (reload) => {
        this.setState({ bulkPublishAction: false, bulkSetCategoryAction: false });
        reload === true && this.handleSearch(-1)
    };

    idForItem(item) {
        return item.ecommerce_id
    }

    renderItem(item) {
        let element, context = { product: item, singleFilterChannel: this.singleFilterValue('with_channel') };

        if ( this.cache.storeDetails && !item['@storeDetails'] ) {
            item['@storeDetails'] = this.cache.storeDetails.find((sd) => sd.ecommerce_id === item.ecommerce_id)
        }

        if ( this.state.fastEdit === true ) {
            element = <ProductsListItemEditProperties ref={(node) => item['@node'] = node}
                                                      onCategoryClick={this.handleSetCategoryFilter}/>
        } else {
            element = <ProductsListItemShow onCategoryClick={this.handleSetCategoryFilter}
                                            onChannelClick={this.handleSetChannelFilter}/>
        }

        return <ResourceItemContext.Provider value={context}>{element}</ResourceItemContext.Provider>
    }

    promotedBulkActions() {
        if ( this.state.fastEdit ) return;

        let category = this.singleFilterValue('category'),
            actions = [{
                content: 'Sales channels',
                onAction: this.handleBulkPublishAction
            }];

        if ( category === 'not defined' ) {
            actions.push({
                content: 'Set category',
                onAction: this.handleBulkSetActegoryAction
            })
        }

        return actions;
    }

    renterAlternateTool() {
        let channel = this.singleFilterValue('with_channel'),
            category = this.singleFilterValue('category'),
            b0, b1, b2;

        if ( channel && channel.match(/^Lazada/) && category && category !== 'not defined' ) {
            let { sending, fastEdit } = this.state;

            if ( fastEdit ) {
                b0 = <MenuBulkEditProperties channel={channel} categoryId={category}
                                             onBlukEditPropertyStateChange={this.handleBulkEditPropertyStateChange}/>;
                b1 = <Button primary icon={SaveMinor} disabled={sending} loading={sending}
                             onClick={this.handleFastEditSave}>Save</Button>;
                b2 = <Button destructive icon={CancelSmallMinor} disabled={sending}
                             onClick={this.handleFastEditCancel}>Cancel</Button>;
            } else {
                b1 = <Button icon={BlogMajorTwotone} onClick={this.handleFastEdit}>Fast edit</Button>;
            }

            return <ButtonGroup>{b0}{b1}{b2}</ButtonGroup>
        }
    }

    renderPageContentTop() {
        let { selectedItems, searchTerm, bulkPublishAction: bPa, bulkSetCategoryAction: bCa } = this.state,
            channel = this.singleFilterValue('with_channel'),
            data = this.requestParams({
                ids: selectedItems,
                term: searchTerm,
                filters: this.appliedFilters
            });

        if ( bPa ) return <ProductBulkPublishDlg data={data} onClose={this.handleBulkDlgClose}/>;
        if ( bCa ) return <ProductBulkSetCategoryDlg data={data} channel={channel} onClose={this.handleBulkDlgClose}/>;
    }
}

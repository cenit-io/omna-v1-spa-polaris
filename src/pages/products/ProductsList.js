import React from 'react';
import {
    Stack, TextStyle, Card, ResourceList, FilterType, Pagination, Button, ButtonGroup
} from '@shopify/polaris';
import {BlogMajorTwotone, SaveMinor, CancelSmallMinor} from '@shopify/polaris-icons';
import {OMNAPage} from "../OMNAPage";
import {Utils} from "../../common/Utils";
import {ProductContext} from "../../common/ProductContext";
import {ProductBulkPublishDlg} from "./ProductBulkPublishDlg";
import {ProductsListItemShow} from "./ProductsListItemShow";
import {ProductsListItemBulkEditProperties} from "./ProductsListItemBulkEditProperties";
import {ProductsListItemBulkEditPropertiesMenu} from "./ProductsListItemBulkEditPropertiesMenu";

export class ProductsList extends OMNAPage {
    constructor(props) {
        super(props);

        this.state.title = 'Products';
        this.state.subTitle = '';
        this.state.searchTerm = Utils.productItems.searchTerm;
        this.state.appliedFilters = Utils.productItems.filters;
        this.state.selectedItems = [];
        this.state.bulkPublishAction = false;
        this.state.sending = false;

        this.bulkEditionItemsRef = [];

        this.renderItem = this.renderItem.bind(this);
        this.renderFilter = this.renderFilter.bind(this);

        this.handleSearch = this.handleSearch.bind(this);
        this.handleSearchNextPage = this.handleSearchNextPage.bind(this);
        this.handleSearchPreviousPage = this.handleSearchPreviousPage.bind(this);
        this.handleFastEdit = this.handleFastEdit.bind(this);
        this.handleFastEditSave = this.handleFastEditSave.bind(this);
        this.handleFastEditCancel = this.handleFastEditCancel.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleSelectionChange = this.handleSelectionChange.bind(this);
        this.handleFiltersChange = this.handleFiltersChange.bind(this);
        this.handleSearchTermChange = this.handleSearchTermChange.bind(this);
        this.handleBulkEditionData = this.handleBulkEditionData.bind(this);
        this.handleBulkPublishClose = this.handleBulkPublishClose.bind(this);
        this.handleBulkPublishAction = this.handleBulkPublishAction.bind(this);
        this.handleSetCategoryFilter = this.handleSetCategoryFilter.bind(this);
        this.handleSetChannelFilter = this.handleSetChannelFilter.bind(this);
        this.idForItem = this.idForItem.bind(this);

        this.timeoutHandle = setTimeout(this.handleSearch, 0);
    }

    get appliedFilters() {
        return this.state.appliedFilters || [];
    }

    set appliedFilters(value) {
        let with_channels = value.filter((f) => f.key === 'with_channel');

        if ( with_channels.length !== 1 ) {
            value = value.filter((f) => f.key != 'category')
        } else {
            Utils.productCategories(with_channels[0].value, this)
        }

        this.state.appliedFilters = value;
    }

    singleFilterValue(key) {
        let filters = this.appliedFilters.filter((f) => f.key === key);

        return filters.length === 1 ? filters[0].value : false
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

    areIdenticalParams(data, productItems) {
        let dFilters = JSON.stringify(data.filters),
            dTerm = data.term,
            dPage = data.page,
            cFilters = JSON.stringify(productItems.filters),
            cTerm = productItems.searchTerm,
            cPage = productItems.page;

        return dPage === cPage && dTerm === cTerm && dFilters === cFilters;
    }

    handleSearch(page) {
        if ( typeof page === 'object' ) {
            if ( page.type === 'click' ) page = -1;
            if ( page.type === 'blur' ) page = undefined;
        }

        let refresh = (page === -1),
            productItems = Utils.productItems,
            data = this.requestParams({
                term: this.state.searchTerm,
                filters: this.appliedFilters,
                page: Math.max(1, page ? page : productItems.page)
            });

        refresh = refresh || !this.areIdenticalParams(data, productItems);

        if ( refresh ) {
            this.loadingOn();
            this.state.loadingProducts !== undefined && this.setState({ loadingProducts: true });
            Utils.productItems = null;
            this.xhr = $.getJSON(this.urlTo('products'), data).done((response) => {
                Utils.productItems = response;
                this.setState({ notifications: response.notifications });

                let msg;

                if ( response.count === 0 ) {
                    msg = 'No products found.';
                } else if ( response.count === 1 ) {
                    msg = 'Only one product was found.';
                } else {
                    msg = response.count + ' products were found.';
                }

                this.flashNotice(msg);
            }).fail((response) => {
                this.flashError('Failed to load the products list from OMNA. ' + Utils.parseResponseError(response));
            }).always(() => {
                this.setState({ loadingProducts: false });
                this.loadingOff();
            });
        } else {
            console.log('Load products from session store...');
            this.setState({ loadingProducts: false });
        }
    }

    handleSearchNextPage() {
        this.handleSearch(Utils.productItems.page + 1)
    }

    handleSearchPreviousPage() {
        this.handleSearch(Utils.productItems.page - 1)
    }

    handleFastEdit() {
        this.setState({ fastEdit: true })
    }

    handleFastEditSave() {
        let products = Utils.productItems.items.filter((product) => product['@isEdited']),
            lastIdx = products.length - 1,
            channel = this.singleFilterValue('with_channel'),
            uri = this.urlTo('product/update'),
            page = Utils.productItems.page;

        products.forEach((product, idx) => {
            let sd = product['@storeDetails'],
                data = this.requestParams({ sch: channel, id: sd.ecommerce_id, product: JSON.stringify(sd) });

            if ( !this.state.sending ) this.setState({ sending: true });
            this.xhr = $.post(uri, data).done((response) => {
                this.flashNotice('The product synchronization process with ' + channel + ' has been started');
            }).fail((response) => {
                this.handleFailRequest(response, 'update');
            }).always(() => {
                if ( idx === lastIdx ) {
                    this.loadingOff();
                    this.setState({ fastEdit: false, sending: false });
                    Utils.productItems = null;
                    this.handleSearch(page);
                }
            });
        });
    }

    handleFastEditCancel() {
        window.productItems = null;
        this.setState({ fastEdit: false })
    }


    handleFailRequest(response, action) {
        let error = Utils.parseResponseError(response),
            channel = this.singleFilterValue('with_channel');

        error = error || '(' + response.state() + ')';

        this.flashError('Failed to ' + action + ' the product in ' + channel + ' sales channel. ' + error);
    }

    handleKeyPress(e) {
        if ( e.keyCode === 13 ) this.handleSearch(-1);
    }

    handleSelectionChange(selectedItems) {
        this.setState({ selectedItems })
    }

    handleSearchTermChange(searchTerm) {
        this.setState({ searchTerm })
    }

    handleFiltersChange(appliedFilters) {
        this.appliedFilters = appliedFilters;
        this.handleSearch(-1)
    }

    handleBulkEditionData() {
        let { selectedItems, searchTerm } = this.state;

        return this.requestParams({
            ids: selectedItems,
            term: searchTerm,
            filters: this.appliedFilters
        })
    }

    handleBulkPublishAction() {
        return this.state.bulkPublishAction
    }

    handleSetCategoryFilter(category) {
        let appliedFilters = this.appliedFilters.filter((f) => f.key !== 'category');

        appliedFilters.push({ key: 'category', value: String(category.category_id) });
        this.handleFiltersChange(appliedFilters)
    }

    handleSetChannelFilter(channel) {
        let appliedFilters = this.appliedFilters;

        if ( !appliedFilters.find((f) => f.key === 'with_channel' && f.value === channel) ) {
            appliedFilters.push({ key: 'with_channel', value: channel });
            this.handleFiltersChange(appliedFilters)
        }
    }

    handleBulkPublishClose(reload) {
        this.setState({ bulkPublishAction: false });
        reload === true && this.handleSearch(-1)
    }

    idForItem(item) {
        return item.ecommerce_id
    }

    renderItem(item) {
        let element, context = { product: item, singleFilterChannel: this.singleFilterValue('with_channel') };

        if ( Utils.productItems.storeDetails && !item['@storeDetails'] ) {
            item['@storeDetails'] = Utils.productItems.storeDetails.find((sd) => sd.ecommerce_id === item.ecommerce_id)
        }

        if ( this.state.fastEdit === true ) {
            element = <ProductsListItemBulkEditProperties ref={(node) => item['@node'] = node}
                                                          onCategoryClick={this.handleSetCategoryFilter}/>
        } else {
            element = <ProductsListItemShow onCategoryClick={this.handleSetCategoryFilter}
                                            onChannelClick={this.handleSetChannelFilter}/>
        }

        return <ProductContext.Provider value={context}>{element}</ProductContext.Provider>
    }

    renderFilter() {
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

        return (
            <div style={{ margin: '10px' }} onKeyDown={this.handleKeyPress}>
                <ResourceList.FilterControl
                    searchValue={this.state.searchTerm}
                    additionalAction={{ content: 'Search', onAction: this.handleSearch }}
                    appliedFilters={this.appliedFilters}
                    filters={filters}
                    onSearchChange={this.handleSearchTermChange}
                    onSearchBlur={this.handleSearch}
                    onFiltersChange={this.handleFiltersChange}
                />
            </div>
        );
    }

    promotedBulkActions() {
        if ( this.state.fastEdit ) return;

        let actions = [{
            content: 'Sales channels',
            onAction: () => this.setState({ bulkPublishAction: true })
        }];

        return actions;
    }

    renterAlternateTool() {
        let channel = this.singleFilterValue('with_channel'),
            category = this.singleFilterValue('category'),
            b0, b1, b2;

        if ( channel && channel.match(/^Lazada/) && category ) {
            let { sending, fastEdit } = this.state;

            if ( fastEdit ) {
                b0 = <ProductsListItemBulkEditPropertiesMenu
                    onBlukStateChange={() => this.setState({ fastEdit: true })}/>
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

    renderPageContent() {
        let { loadingProducts, loadingProductCategories } = this.state,
            { items, page, pages, count } = Utils.productItems;

        if ( loadingProducts === undefined && count === 0 ) return Utils.renderLoading();

        return (
            <Card>
                <ProductBulkPublishDlg active={this.handleBulkPublishAction} onClose={this.handleBulkPublishClose}
                                       bulkEditionData={this.handleBulkEditionData}/>
                <ResourceList
                    resourceName={{ singular: 'product', plural: 'products' }}
                    items={items}
                    loading={loadingProducts || loadingProductCategories}
                    hasMoreItems={true}
                    renderItem={this.renderItem}
                    selectedItems={this.state.selectedItems}
                    idForItem={this.idForItem}
                    onSelectionChange={this.handleSelectionChange}
                    filterControl={this.renderFilter()}
                    promotedBulkActions={this.promotedBulkActions()}
                    alternateTool={this.renterAlternateTool()}
                />

                <Card sectioned>
                    <Stack distribution="fill" wrap="false">
                        <TextStyle variation="subdued">Page {page} of {pages} for {count} products:</TextStyle>
                        <Stack distribution="trailing" wrap="false">
                            <Pagination
                                hasPrevious={page > 1}
                                onPrevious={this.handleSearchPreviousPage}
                                hasNext={page < pages}
                                onNext={this.handleSearchNextPage}
                            />
                        </Stack>
                    </Stack>
                </Card>
            </Card>
        );
    }
}

import React from 'react';
import {Stack, TextStyle, Card, ResourceList, FilterType, Pagination, Thumbnail, Badge} from '@shopify/polaris';
import {OMNAPage} from "../OMNAPage";
import {ProductBulkPublishDlg} from "./ProductBulkPublishDlg";
import {Utils} from "../../common/Utils";

export class ProductsList extends OMNAPage {
    constructor(props) {
        super(props);

        this.state.title = 'Products';
        this.state.subTitle = '';
        this.state.searchTerm = Utils.productItems.searchTerm;
        this.state.appliedFilters = Utils.productItems.filters;
        this.state.selectedItems = [];
        this.state.bulkPublishAction = false;

        this.renderItem = this.renderItem.bind(this);
        this.renderFilter = this.renderFilter.bind(this);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSearchNextPage = this.handleSearchNextPage.bind(this);
        this.handleSearchPreviousPage = this.handleSearchPreviousPage.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleSelectionChange = this.handleSelectionChange.bind(this);
        this.handleFiltersChange = this.handleFiltersChange.bind(this);
        this.handleSearchTermChange = this.handleSearchTermChange.bind(this);
        this.handleBulkEditionData = this.handleBulkEditionData.bind(this);
        this.handleBulkPublishClose = this.handleBulkPublishClose.bind(this);
        this.handleBulkPublishAction = this.handleBulkPublishAction.bind(this);
        this.idForItem = this.idForItem.bind(this);

        this.timeoutHandle = setTimeout(this.handleSearch, 0);
    }

    get appliedFilters() {
        return this.state.appliedFilters || [];
    }

    set appliedFilters(value) {
        let with_channels = value.filter((f) => f.key === 'with_channel');

        if ( with_channels.length !== 1 ) value = value.filter((f) => f.key != 'category')

        this.state.appliedFilters = value;
    }

    categoryFilterOptions(channel) {
        let options = Utils.productCategories(channel, this).items.map((c) => {
            let id = String(c.category_id);
            return { key: id, value: id, label: c.name }
        });

        options.unshift({ key: 'not defined', value: 'not defined', label: 'not defined' });

        return options
    }

    image(item) {
        const img = Utils.defaultImage(item);

        return img ? (<Thumbnail source={img.small} alt={item.title}/>) : '';
    }

    loadingOn() {
        if ( this.state.loading === false ) this.setState({ loading: true });
        super.loadingOn();
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
            Utils.productItems = null;
            this.xhr = $.getJSON(this.urlTo('products'), data).done((response) => {
                Utils.productItems = response;
                this.setState({ loading: false, notifications: response.notifications });

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
                const error = response.responseJSON ? response.responseJSON.error : response.responseText;
                this.flashError('Failed to load the products list from OMNA.' + error);
            }).always(this.loadingOff);
        } else {
            console.log('Load products from session store...');
            this.setState({ loading: false });
        }
    }

    handleSearchNextPage() {
        this.handleSearch(Utils.productItems.page + 1)
    }

    handleSearchPreviousPage() {
        this.handleSearch(Utils.productItems.page - 1)
    }

    handleEdit(itemId) {
        let { items } = Utils.productItems,
            index = items.findIndex((item) => item.ecommerce_id === itemId);

        OMNA.render('product', { product: items[index], products: items, productIndex: index });
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

    handleBulkPublishClose(reload) {
        this.setState({ bulkPublishAction: false });
        reload === true && this.handleSearch(-1)
    }

    idForItem(item) {
        return item.ecommerce_id
    }

    isAvailableChannel(name) {
        return this.activeChannels.find((channel) => channel.name === name)
    }

    renderStoreWithStatus(sch, idx) {
        if ( !this.isAvailableChannel(sch.channel) ) return;

        let syncStatus = sch.sync_task ? sch.sync_task.status : null,
            status, tip, progress, hasErrors, verb,
            channelName = this.channelName(sch.channel, false, true);

        if ( syncStatus ) {
            hasErrors = sch.notifications.find((n) => n.status === 'critical');

            if ( hasErrors ) syncStatus = 'failed';

            switch ( syncStatus ) {
                case 'pending':
                    status = 'attention';
                    progress = 'incomplete';
                    break;
                case 'running':
                    status = 'info';
                    progress = 'partiallyComplete';
                    break;
                case 'completed':
                    status = 'success';
                    progress = 'complete';
                    break;
                default:
                    status = 'warning';
                    progress = 'incomplete';
            }

            verb = syncStatus.match(/ed$/) ? ' has ' : ' is ';
            tip = 'Synchronize process with ' + channelName + verb + syncStatus + '.';
        } else {
            status = 'new';
            tip = 'It has never been synchronized with ' + channelName + '.'
        }

        return <Badge status={status} progress={progress} key={idx}><span title={tip}>{channelName}</span></Badge>
    }

    renderStores(product) {
        let salesChannels = product.sales_channels || [];

        salesChannels.sort((a, b) => a.channel < b.channel ? -1 : 1);

        if ( salesChannels.length > 0 ) {
            return (
                <Stack distribution="trailing" wrap="false">
                    <TextStyle variation="positive">
                        {salesChannels.length === 1 ? 'Sales channel' : 'Sales channels'}:
                    </TextStyle>;
                    <Stack distribution="leading" spacing="extraTight" wrap="false">
                        {salesChannels.map((sch, idx) => this.renderStoreWithStatus(sch, idx))}
                    </Stack>
                </Stack>
            )
        }
    }

    renderItem(item) {
        const
            price = item.variants[0].price,
            variants = Utils.variants(item, false),
            vLabel = variants.length === 1 ? 'variant' : 'variants',
            title = (
                <Stack distribution="fill" wrap="false">
                    <TextStyle variation="strong">{item.title}</TextStyle>
                    <Stack distribution="trailing" spacing="extraLoose" wrap="false">
                        <TextStyle variation="positive">{variants.length}{' '}{vLabel}</TextStyle>
                        <TextStyle variation="positive">${price}</TextStyle>
                    </Stack>
                </Stack>
            );

        return (
            <ResourceList.Item
                id={item.ecommerce_id}
                media={this.image(item)}
                onClick={this.handleEdit}>

                <Card sectioned title={title}>
                    {this.renderStores(item)}
                </Card>
            </ResourceList.Item>
        );
    }

    renderFilter() {
        let { searchTerm } = this.state,
            appliedFilters = this.appliedFilters,
            channelOptions = this.activeChannels.map((ac) => {
                return { key: ac.name, value: ac.name, label: this.channelName(ac, false, true) }
            }),
            filters = [
                {
                    key: 'sales_channels',
                    label: 'Sales channels',
                    operatorText: [
                        { key: 'with_channel', optionLabel: 'include' },
                        { key: 'without_channel', optionLabel: 'exnclude' }
                    ],
                    type: FilterType.Select,
                    options: channelOptions,
                }
            ],
            with_channels = appliedFilters.filter((f) => f.key === 'with_channel');

        if ( with_channels.length === 1 ) {
            filters.push(
                {
                    key: 'category',
                    label: 'Category',
                    operatorText: 'is',
                    type: FilterType.Select,
                    options: this.categoryFilterOptions(with_channels[0].value),
                }
            )
        }

        return (
            <div style={{ margin: '10px' }} onKeyDown={this.handleKeyPress}>
                <ResourceList.FilterControl
                    searchValue={searchTerm}
                    additionalAction={{ content: 'Search', onAction: this.handleSearch }}
                    appliedFilters={appliedFilters}
                    filters={filters}
                    onSearchChange={this.handleSearchTermChange}
                    onSearchBlur={this.handleSearch}
                    onFiltersChange={this.handleFiltersChange}
                />
            </div>
        );
    }

    promotedBulkActions() {
        return [
            {
                content: 'Sales channels',
                onAction: () => this.setState({ bulkPublishAction: true })
            }
        ]
    }

    renderPageContent() {
        let { loading } = this.state,
            { items, page, pages, count } = Utils.productItems;

        if ( loading === undefined && count === 0 ) return Utils.renderLoading();

        return (
            <Card>
                <ProductBulkPublishDlg active={this.handleBulkPublishAction} onClose={this.handleBulkPublishClose}
                                       bulkEditionData={this.handleBulkEditionData}/>
                <ResourceList
                    resourceName={{ singular: 'product', plural: 'products' }}
                    items={items}
                    loading={loading}
                    hasMoreItems={true}
                    renderItem={this.renderItem}
                    selectedItems={this.state.selectedItems}
                    idForItem={this.idForItem}
                    onSelectionChange={this.handleSelectionChange}
                    filterControl={this.renderFilter()}
                    promotedBulkActions={this.promotedBulkActions()}
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

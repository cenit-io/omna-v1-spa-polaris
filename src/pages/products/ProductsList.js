import React from 'react';
import {Stack, TextStyle, Card, ResourceList, FilterType, Pagination, Thumbnail, Badge} from '@shopify/polaris';
import {OMNAPage} from "../OMNAPage";
import {ProductStoreEnableAction} from "./ProductStoreEnableAction";

export class ProductsList extends OMNAPage {
    constructor(props) {
        super(props);

        this.state.title = 'Products';
        this.state.subTitle = '';
        this.state.searchTerm = this.searchTerm;
        this.state.selectedItems = [];
        this.state.bulkStoreEnableAction = false;

        this.renderItem = this.renderItem.bind(this);
        this.renderFilter = this.renderFilter.bind(this);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleSelectionChange = this.handleSelectionChange.bind(this);
        this.handleFiltersChange = this.handleFiltersChange.bind(this);
        this.handleSearchTermChange = this.handleSearchTermChange.bind(this);
        this.handleBulkStoreEnableClose = this.handleBulkStoreEnableClose.bind(this);
        this.idForItem = this.idForItem.bind(this);

        setTimeout(this.handleSearch, 0);
    }

    get searchTerm() {
        return this.getSessionItem('products-search-term', '');
    }

    set searchTerm(value) {
        this.setSessionItem('products-search-term', value);
    }

    get appliedFilters() {
        return JSON.parse(this.getSessionItem('products-search-filters', '[]'));
    }

    set appliedFilters(value) {
        this.setSessionItem('products-search-filters', JSON.stringify(value));
    }

    get channelsFilters() {
        let appliedFilters = this.appliedFilters,
            channelsFilters = [];

        this.activeChannels.forEach((channel) => {
            let applied = appliedFilters.find((f) => {
                return f.key.match(/^with(out)?_channel$/) && f.value === this.channelName(channel, false, true)
            });

            !applied && channelsFilters.push(this.channelName(channel, false, true))
        });

        return channelsFilters
    }

    image(item) {
        const img = this.defaultImage(item);

        return img ? (<Thumbnail source={img.small} alt={item.title}/>) : '';
    }

    loadingOn() {
        if ( this.state.loading === false ) this.setState({ loading: true });
        super.loadingOn();
    }

    handleSearch(page) {
        if ( typeof page === 'object' ) return this.handleSearch();

        let searchTerm = this.searchTerm,
            productsItems = this.productItems,
            data = this.requestParams({
                term: this.state.searchTerm,
                page: Math.max(1, page ? page : productsItems.page)
            });

        if ( searchTerm === data.term && productsItems.page === data.page ) {
            console.log('Load products from session store...');
            this.setState({ loading: false });
        } else {
            this.loadingOn();
            this.productItems = null;
            $.getJSON(this.urlTo('products'), data).done((response) => {
                this.searchTerm = data.term;
                this.productItems = response;
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
            }).always(() => this.loadingOff());
        }
    }

    handleEdit(itemId) {
        let { items } = this.productItems,
            index = items.findIndex((item) => item.ecommerce_id === itemId);

        OMNA.render('product', { product: items[index], products: items, productIndex: index });
    }

    handleKeyPress(e) {
        if ( e.keyCode === 13 ) {
            e.preventDefault();
            this.handleSearch();
            return false;
        }
    }

    handleSelectionChange(selectedItems) {
        this.setState({ selectedItems })
    }

    handleSearchTermChange(searchTerm) {
        this.setState({ searchTerm })
    }

    handleFiltersChange(appliedFilters) {
        this.appliedFilters = appliedFilters;
        this.handleSearch()
    }

    handleBulkStoreEnableClose(channels) {
        this.setState({ bulkStoreEnableAction: false });

        if ( channels ) {
            let uri = this.urlTo('product/bulk/publish'),
                data = this.requestParams({
                    ids: this.state.selectedItems,
                    channels: {}
                });

            Object.keys(channels).forEach((n) => channels[n] !== 'indeterminate' && (data.channels[n] = channels[n]));

            this.loadingOn();
            axios.post(uri, data).then((response) => {
                this.productItems = null;
                this.handleSearch()
            }).catch(
                (error) => this.flashError('Failed to load docuement.' + error)
            ).finally(() => this.loadingOff())
        }
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
            variants = this.variants(item, false),
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
        let { searchTerm } = this.state;

        return (
            <div style={{ margin: '10px' }} onKeyDown={this.handleKeyPress}>
                <ResourceList.FilterControl
                    searchValue={searchTerm}
                    onSearchChange={this.handleSearchTermChange}
                    additionalAction={{ content: 'Search', onAction: this.handleSearch }}
                    appliedFilters={this.appliedFilters}
                    filters={[
                        {
                            key: 'with_channel',
                            label: 'Sales channels include',
                            operatorText: '',
                            type: FilterType.Select,
                            options: this.channelsFilters,
                        },
                        {
                            key: 'without_channel',
                            label: 'Sales channels exclude',
                            operatorText: '',
                            type: FilterType.Select,
                            options: this.channelsFilters,
                        }
                    ]}
                    onFiltersChange={this.handleFiltersChange}
                />
            </div>
        );
    }

    promotedBulkActions() {
        return [
            {
                content: 'Sales channels',
                onAction: () => this.setState({ bulkStoreEnableAction: true })
            }
        ]
    }

    renderPageContent() {
        const
            { loading, bulkStoreEnableAction } = this.state,
            { items, page, pages, count } = this.productItems;

        if ( loading === undefined && count === 0 ) return this.renderLoading();

        return (
            <Card>
                <ProductStoreEnableAction active={() => bulkStoreEnableAction}
                                          onClose={this.handleBulkStoreEnableClose}/>
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
                                onPrevious={() => this.handleSearch(page - 1)}
                                hasNext={page < pages}
                                onNext={() => this.handleSearch(page + 1)}
                            />
                        </Stack>
                    </Stack>
                </Card>
            </Card>
        );
    }
}

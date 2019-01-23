import React from 'react';
import {Stack, TextStyle, Card, ResourceList, Pagination, Thumbnail, Badge} from '@shopify/polaris';
import {OMNAPage} from "../OMNAPage";
import {ProductStoreEnableAction} from "./ProductStoreEnableAction";

export class ProductsList extends OMNAPage {
    constructor(props) {
        super(props);

        this.state.title = 'Products';
        this.state.subTitle = '';
        this.state.products = this.productItems;
        this.state.searchTerm = this.searchTerm;
        this.state.selectedItems = [];
        this.state.loading = true;
        this.state.enableStoreActive = false;

        this.renderItem = this.renderItem.bind(this);
        this.renderFilter = this.renderFilter.bind(this);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleSelectionChange = this.handleSelectionChange.bind(this);

        setTimeout(this.handleSearch, 0);
    }

    get searchTerm() {
        return this.getSessionItem('products-search-term', '');
    }

    set searchTerm(value) {
        this.setSessionItem('products-search-term', value);
    }

    image(item) {
        const img = this.defaultImage(item);

        return img ? (<Thumbnail source={img.small} alt={item.title}/>) : '';
    }

    loadingOn() {
        if ( !this.state.loading ) this.setState({ loading: true });
        super.loadingOn();
    }

    handleSearch(page) {
        const
            searchTerm = this.searchTerm,
            productsItems = this.productItems,
            data = this.requestParams({
                term: this.state.searchTerm,
                page: page ? page : (productsItems ? productsItems.page : 1)
            });

        if ( productsItems && searchTerm === data.term && productsItems.page === data.page ) {
            this.setState({ products: productsItems, loading: false });
        } else {
            this.loadingOn();
            this.productItems = null;
            $.getJSON(this.urlTo('products'), data).done((response) => {
                this.setState({ products: response, loading: false, notifications: response.notifications });
                this.searchTerm = data.term;
                this.productItems = response;

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
        const { items } = this.state.products;

        const index = items.findIndex((item) => item.product_id === itemId);

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

    idForItem(item) {
        return item.product_id
    }

    isAvailableChannel(name) {
        const channel = this.state.appContext.settings.channels[name];

        return channel && channel.connected
    }

    renderStoreWithStatus(sch, idx) {
        let syncStatus = sch.sync_task ? sch.sync_task.status : null,
            status, tip, progress, hasErrors, verb;

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
            tip = 'Synchronize process with ' + sch.channel + verb + syncStatus + '.';
        } else {
            status = 'new';
            tip = 'It has never been synchronized with ' + sch.channel + '.'
        }

        return <Badge status={status} progress={progress} key={idx}><span title={tip}>{sch.channel}</span></Badge>
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
                id={item.product_id}
                media={this.image(item)}
                onClick={this.handleEdit}>

                <Card sectioned title={title}>
                    {this.renderStores(item)}
                </Card>
            </ResourceList.Item>
        );
    }

    renderFilter() {
        const { searchTerm } = this.state;

        return (
            <div style={{ margin: '10px' }} onKeyDown={this.handleKeyPress}>
                <ResourceList.FilterControl
                    searchValue={searchTerm}
                    onSearchChange={(searchTerm) => this.setState({ searchTerm })}
                    additionalAction={{ content: 'Search', onAction: () => this.handleSearch() }}
                />
            </div>
        );
    }

    promotedBulkActions() {
        return [
            {
                content: 'Sales channels',
                onAction: () => this.setState({ enableStoreActive: true })
            }
        ]
    }

    renderPageContent() {
        const
            { loading, products, enableStoreActive } = this.state,
            { items, page, pages, count } = products;

        return (
            <Card>
                <ProductStoreEnableAction active={() => enableStoreActive}
                                          onClose={() => this.setState({ enableStoreActive: false })}/>
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

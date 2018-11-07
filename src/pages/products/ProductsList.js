import React from 'react';
import {Stack, TextStyle, Card, ResourceList, Pagination, Thumbnail, Badge} from '@shopify/polaris';
import {OMNAPage} from "../OMNAPage";

export class ProductsList extends OMNAPage {
    constructor(props) {
        super(props);

        this.state.title = 'Products';
        this.state.subTitle = '';
        this.state.products = this.productItems;
        this.state.searchTerm = this.searchTerm;
        this.state.loading = true;

        this.renderItem = this.renderItem.bind(this);
        this.renderFilter = this.renderFilter.bind(this);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);

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

    stores(item) {
        return (item.sales_channels || []).map((item, idx) => <Badge key={idx}>{item.channel}</Badge>);
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
            $.getJSON(this.urlTo('products'), data).done((response) => {
                this.setState({ products: response, loading: false });
                this.searchTerm = data.term;
                this.productItems = response;

                var msg;

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

    renderStores(item) {
        const
            stores = this.stores(item),
            sLabel = stores.length === 1 ? 'Sales channel' : 'Sales channels';

        if ( stores.length > 0 ) {
            return (
                <Stack distribution="trailing" wrap="false">
                    <TextStyle variation="positive">{sLabel}:</TextStyle>;
                    <Stack distribution="leading" spacing="extraTight" wrap="false">{stores}</Stack>
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
                media={this.image.apply(this, [item])}
                onClick={this.handleEdit}>

                <Card sectioned title={title}>
                    {this.renderStores.apply(this, [item])}
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

    renderPageContent() {
        const { loading, products } = this.state;

        if ( loading ) return this.renderLoading();

        const { items, page, pages, count } = products;

        return (
            <Card>
                <ResourceList
                    resourceName={{ singular: 'product', plural: 'products' }}
                    items={items}
                    hasMoreItems={true}
                    renderItem={this.renderItem}
                    filterControl={this.renderFilter()}
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

import React from 'react';
import {Stack, TextStyle, Card, ResourceList, Page, Pagination, Thumbnail, Badge} from '@shopify/polaris';
import {OMNAPage} from './Commons';

export class ProductsPage extends OMNAPage {
    constructor(props) {
        super(props);

        this.state.title = 'Products';
        this.state.subTitle = '';
        this.state.products = { items: [], count: 0, page: 1, pages: 1 };
        this.state.searchTerm = '';
        this.state.alreadyLoad = false;

        this.renderItem = this.renderItem.bind(this);
        this.renderFilter = this.renderFilter.bind(this);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    image(item) {
        const img = this.defaultImage(item);

        return img ? (<Thumbnail source={img.small} alt={item.title}/>) : '';
    }

    stores(item) {
        return (item.sales_channels || []).map(function (item, idx) {
            return (<Badge key={idx}>{item.channel}</Badge>)
        });
    }

    handleSearch(page) {
        const
            data = this.requestParams({ term: this.state.searchTerm, page: page }),
            uri = this.urlTo('products');

        this.loadingOn();
        $.getJSON(uri, data).done(function (response) {
            this.setState({ products: response, alreadyLoad: true });

            var msg;

            if (response.count == 0) {
                msg = 'No products found.';
            } else if (response.count == 1) {
                msg = 'Only one product was found.';
            } else {
                msg = response.count + ' products were found.';
            }

            this.flashNotice(msg);
        }.bind(this)).fail(function (response) {
            const error = response.responseJSON ? response.responseJSON.error : '';
            this.flashError('Failed to load the products list from OMNA.' + error);
        }.bind(this)).always(function () {
            this.loadingOff();
        }.bind(this));
    }

    handleEdit(itemId) {
        const { items } = this.state.products;

        const item = items.find(function (item) {
            return item.product_id == itemId;
        });

        OMNA.render('product', { product: item, products: items });
    }

    handleKeyPress(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.handleSearch(1);
            return false;
        }
    }

    renderStores(item) {
        const
            stores = this.stores(item),
            sLabel = stores.length == 1 ? 'Sales channel' : 'Sales channels';

        if (stores.length > 0) {
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
            price = this.defaultVariant(item).price,
            variants = this.variants(item, false),
            vLabel = variants.length == 1 ? 'variant' : 'variants',
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
                    onSearchChange={(searchTerm) => this.setState({ searchTerm }) }
                    additionalAction={{ content: 'Search', onAction: () => this.handleSearch(1) }}
                />
            </div>
        );
    }

    render() {
        const
            { alreadyLoad, products } = this.state,
            { items, page, pages, count, notifications } = products,

            cardItems = (
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

        alreadyLoad || this.handleSearch(1);

        return (
            <Page title={this.renderTitle()} separator={true}>
                {this.renderInactive()}
                {alreadyLoad && this.renderNotifications(notifications)}
                {alreadyLoad ? cardItems : this.renderLoading()}
            </Page>
        );
    }
}

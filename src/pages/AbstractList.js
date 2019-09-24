import React from 'react';
import {Stack, TextStyle, Card, ResourceList, Pagination} from '@shopify/polaris';
import {OMNAPage} from "./OMNAPage";
import {Utils} from "../common/Utils";

export class AbstractList extends OMNAPage {
    constructor(props) {
        super(props);

        this.state.subTitle = '';
        this.state.searchTerm = this.cache.searchTerm;
        this.state.appliedFilters = this.cache.filters;
        this.state.sort = this.cache.sort;
        this.state.selectedItems = [];

        this.state.sending = false;

        this.renderItem = this.renderItem.bind(this);
        this.renderFilter = this.renderFilter.bind(this);

        this.timeoutHandle = setTimeout(this.handleSearch, 0);
    }

    get resourceName() {
        return { singular: 'item', plural: 'items' }
    }

    get resourceUrl() {
        throw Error("Can't call abstract method!")
    }

    get cache() {
        throw Error("Can't call abstract method!")
    }

    set cache(value) {
        throw Error("Can't call abstract method!")
    }

    get sortOptions() {
        return null
    }

    get filters() {
        return []
    }

    get appliedFilters() {
        return this.state.appliedFilters || [];
    }

    set appliedFilters(value) {
        this.state.appliedFilters = value;
    }

    get isLoading() {
        return this.state.loadingResourceItems
    }

    singleFilterValue(key) {
        let filters = this.appliedFilters.filter((f) => f.key === key);

        return filters.length === 1 ? filters[0].value : false
    }

    areIdenticalParams(newData, currentData) {
        let nFilters = JSON.stringify(newData.filters),
            nTerm = newData.term,
            nPage = newData.page,
            nSort = newData.sort,

            cFilters = JSON.stringify(currentData.filters),
            cTerm = currentData.searchTerm,
            cPage = currentData.page,
            cSort = currentData.sort;

        return nPage === cPage && nTerm === cTerm && nFilters === cFilters && nSort === cSort;
    }

    handleSearch = (page) => {
        if (typeof page === 'object') {
            if (page.type === 'click') page = -1;
            if (page.type === 'blur') page = undefined;
        }

        let refresh = (page === -1),
            resourceItems = this.cache,
            resourceName = this.resourceName,
            data = this.requestParams({
                term: this.state.searchTerm,
                filters: this.appliedFilters,
                sort: this.state.sort,
                page: Math.max(1, page ? page : resourceItems.page)
            });

        refresh = refresh || !this.areIdenticalParams(data, resourceItems);

        if (refresh) {
            this.loadingOn();
            this.state.loadingResourceItems !== undefined && this.setState({ loadingResourceItems: true });
            this.cache = null;
            this.xhr = $.getJSON({
                url: this.resourceUrl,
                xhrFields: { withCredentials: true },
                data: data
            }).done((response) => {
                this.cache = response;
                this.setState({ notifications: response.notifications });

                let msg;

                if (response.count === 0) {
                    msg = 'No ' + resourceName.plural + ' found.';
                } else if (response.count === 1) {
                    msg = 'Only one ' + resourceName.singular + ' was found.';
                } else {
                    msg = response.count + ' ' + resourceName.plural + ' were found.';
                }

                this.flashNotice(msg);
            }).fail((response) => {
                this.flashError('Failed to load the ' + resourceName.plural + ' list from OMNA. ' + Utils.parseResponseError(response));
            }).always(() => {
                this.setState({ loadingResourceItems: false });
                this.loadingOff();
            });
        } else {
            console.log('Load ' + resourceName.plural + ' from session store...');
            this.setState({ loadingResourceItems: false });
        }
    };

    handleSearchNextPage = () => {
        this.handleSearch(this.cache.page + 1)
    };

    handleSearchPreviousPage = () => {
        this.handleSearch(this.cache.page - 1)
    };

    handleKeyPress = (e) => {
        if (e.keyCode === 13) this.handleSearch(-1);
    };

    handleSelectionChange = (selectedItems) => {
        this.setState({ selectedItems })
    };

    handleSearchTermChange = (searchTerm) => {
        this.setState({ searchTerm })
    };

    handleFiltersChange = (appliedFilters) => {
        this.appliedFilters = appliedFilters;
        this.handleSearch(-1)
    };

    sortBy(value) {
        this.state.sort = value;
        this.handleSearch(-1)
    }

    idForItem(item) {
        return item.id
    }

    renderFilter() {
        return (
            <div style={{ margin: '10px' }} onKeyDown={this.handleKeyPress}>
                <ResourceList.FilterControl
                    searchValue={this.state.searchTerm}
                    additionalAction={{ content: 'Search', onAction: this.handleSearch }}
                    appliedFilters={this.appliedFilters}
                    filters={this.filters}
                    onSearchChange={this.handleSearchTermChange}
                    onSearchBlur={this.handleSearch}
                    onFiltersChange={this.handleFiltersChange}
                />
            </div>
        );
    }

    promotedBulkActions() {
        return null;
    }

    renterAlternateTool() {
        return null;
    }

    renderItem(item) {
        throw Error("Can't call abstract method!")
    }

    renderPageContentTop() {
        return null;
    }

    renderPageContent(topContent) {
        let { loadingResourceItems, selectedItems, sort } = this.state,
            { items, page, pages, count } = this.cache;

        if (loadingResourceItems === undefined && count === 0) return Utils.renderLoading();

        return (
            <Card>
                {this.renderPageContentTop()}
                <ResourceList
                    resourceName={this.resourceName}
                    items={items}
                    loading={this.isLoading}
                    hasMoreItems={true}
                    renderItem={this.renderItem}
                    idForItem={this.idForItem}
                    selectedItems={selectedItems}
                    filterControl={this.renderFilter()}
                    promotedBulkActions={this.promotedBulkActions()}
                    alternateTool={this.renterAlternateTool()}
                    sortOptions={this.sortOptions}
                    sortValue={sort}
                    showHeader={true}
                    onSelectionChange={this.handleSelectionChange}
                />

                <Card sectioned>
                    <Stack distribution="fill" wrap="false">
                        <TextStyle variation="subdued">
                            Page {page} of {pages} for {count} {this.resourceName.plural}:
                        </TextStyle>
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
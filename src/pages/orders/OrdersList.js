import React from 'react';
import { OMNAPage } from "../OMNAPage";
import { OrderItem } from './OrderItem';
import './OrdersList.css';
import { Card, FilterType, Pagination, ResourceList, Stack, TextStyle, Badge, Tooltip } from '@shopify/polaris';
import { Utils } from '../../common/Utils';

const SORT_OPTIONS = [
    { label: 'Channel A–Z', value: 'channel ASC' },
    { label: 'Channel Z–A', value: 'channel DESC' }
];

export class OrdersList extends OMNAPage {

    constructor(props) {
        super(props);

        this.state = {
            title: 'Orders',
            subTitle: '',
            searchTerm: Utils.orderItems.searchTerm,
            appliedFilters: Utils.orderItems.filters,
            sortValue: 'channel ASC'
        };

        this.renderItem = this.renderItem.bind(this);
        this.renderFilter = this.renderFilter.bind(this);

        this.loadOrders = this.loadOrders.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleFiltersChange = this.handleFiltersChange.bind(this);
        this.handleSearchTermChange = this.handleSearchTermChange.bind(this);
        this.handleSearchNextPage = this.handleSearchNextPage.bind(this);
        this.handleSearchPreviousPage = this.handleSearchPreviousPage.bind(this);

        this.handleSortChange = this.handleSortChange.bind(this);
        this.onClickOrderItem = this.onClickOrderItem.bind(this);

        this.timeoutHandle = setTimeout(this.loadOrders, 0);

    }

    get appliedFilters() {
        return this.state.appliedFilters || [];
    }

    set appliedFilters(value) {
        this.state.appliedFilters = value;
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

    get channelsFiltersToParams() {
        let channelsFilters = [];

        this.appliedFilters.forEach((f) => {
            if ( f.key.match(/^with(out)?_channel$/) ) {
                let channel = this.activeChannels.find((channel) => {
                    return f.value === this.channelName(channel, false, true)
                });
                channelsFilters.push({ key: f.key, value: f.value, channel: channel.name });
            }
        });

        return channelsFilters
    }

    loadingOn() {
        if ( this.state.loading === false ) this.setState({ loading: true });
        super.loadingOn();
    }

    areIdenticalParams(data, orderItems) {
        let dFilters = JSON.stringify(data.filters),
            dTerm = data.term,
            dPage = data.page,
            dSort = data.sortValue,
            cFilters = JSON.stringify(orderItems.filters),
            cTerm = orderItems.searchTerm,
            cPage = orderItems.page,
            cSort = orderItems.sortValue;

        return dPage === cPage && dTerm === cTerm && dFilters === cFilters && dSort ===cSort;
    }

    handleKeyPress(e) {
        if ( e.keyCode === 13 ) this.loadOrders(-1);
    }

    handleSearchTermChange(searchTerm) {
        this.setState({ searchTerm })
    }

    handleFiltersChange(appliedFilters) {
        this.appliedFilters = appliedFilters;
        this.loadOrders(-1)
    }

    handleSearchNextPage() {
        this.loadOrders(this.orderItems.page + 1)
    }

    handleSearchPreviousPage() {
        this.loadOrders(this.orderItems.page - 1)
    }

    handleSortChange(sortValue) {
        this.setState({ sortValue }, ()=>{
            this.loadOrders(-1);
        });

    }

    loadOrders(page){
        if ( typeof page === 'object' ) {
            if ( page.type === 'click' ) this.loadOrders(-1);
            if ( page.type === 'blur' ) page = undefined;
        }

        let refresh = (page === -1),
            orderItems = Utils.orderItems,
            data = this.requestParams({
                term: this.state.searchTerm,
                filters: this.channelsFiltersToParams,
                sortValue: this.state.sortValue,
                page: Math.max(1, page ? page : orderItems.page)
            });

        refresh = refresh || !this.areIdenticalParams(data, orderItems);
        if (refresh){
            this.loadingOn();
            this.orderItems = null;
            this.xhr = $.getJSON(this.urlTo('orders'), data).done((response) => {
                Utils.orderItems = response;
                this.setState({ loading: false});
                let msg;

                if ( response.count === 0 ) {
                    msg = 'No Orders found.';
                } else if ( response.count === 1 ) {
                    msg = 'Only one order was found.';
                } else {
                    msg = response.count + ' orders were found.';
                }

                this.flashNotice(msg);

            }).fail((response) => {
                const error = response.responseJSON ? response.responseJSON.error : response.responseText;
                this.flashError('Failed to load the orders list from OMNA.' + error);
            }).always(this.loadingOff);;

        }
        else {
            console.log('Load orders from session store...');
            this.setState({ loading: false });
        }

    }

    onClickOrderItem (item){
        console.log('action click' + ' item: ' + item.number);
    }


    renderFilter() {
        let { searchTerm } = this.state;

        return (
            <div style={{ margin: '10px' }} onKeyDown={this.handleKeyPress}>
                <ResourceList.FilterControl
                    searchValue={searchTerm}
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
                    onSearchChange={this.handleSearchTermChange}
                    onSearchBlur={this.loadOrders}
                    onFiltersChange={this.handleFiltersChange}
                />
            </div>
        );
    }

    renderItem (item){
        return (
            <OrderItem item={item} onClick={() => this.onClickOrderItem(item)}/>
        );
    };



    renderPageContent(){
        let { loading, sortValue } = this.state,
            { items, page, pages, count } = Utils.orderItems;

        if ( loading === undefined && count === 0 ) return Utils.renderLoading();

        return (
            <Card>
                <ResourceList
                    resourceName={{ singular: 'order', plural: 'orders' }}
                    loading={loading}
                    items={items}
                    renderItem={this.renderItem}
                    filterControl={this.renderFilter()}
                    sortOptions={SORT_OPTIONS}
                    sortValue={sortValue}
                    onSortChange={this.handleSortChange}
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
        )

    }

}

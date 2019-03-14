import React from 'react';
import {Stack, TextStyle, Card, ResourceList, Thumbnail, Badge, Spinner} from '@shopify/polaris';
import {Utils} from "../../common/Utils";
import {OMNAComponent} from "../../common/OMNAComponent";
import {ProductContext} from "../../common/ProductContext";

export class ProductsListItemShow extends OMNAComponent {
    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
    }

    handleEdit(itemId) {
        let items = Utils.productItems.items,
            index = items.findIndex((item) => item.ecommerce_id === itemId);

        OMNA.render('product', { product: items[index], products: items, productIndex: index });
    }

    getProductCategory(item, channel) {
        if ( !channel ) return;

        let storeDetails = (Utils.productItems.storeDetails || []).find((sd) => sd.ecommerce_id === item.ecommerce_id),
            categoryId = storeDetails[Utils.productCategoryAttr(channel)];

        if ( !window.categories || !window.categories[channel] ) {
            window.categories = {};
            window.categories[channel] = true;
        }

        let data = categoryId ? window.categories[categoryId] : { name: 'Category is not defined' };

        if ( !data ) {
            window.categories[categoryId] = data = { category_id: categoryId, senders: [this] };
            this.loadingOn();
            this.xhr = $.getJSON({
                url: this.urlTo('nomenclatures'),
                data: this.requestParams({
                    entity: 'Category', sch: channel, idAttr: 'category_id', textAttr: 'name', id: categoryId
                })
            }).done((response) => {
                let senders = window.categories[categoryId].senders;
                window.categories[categoryId] = response.item;
                senders.forEach((sender) => sender.setState({ loadingProductCategory: false }))
            }).fail((response) => {
                const msg = 'Failed to load ' + channel + ' category. ' + response.responseJSON.error;
                this.flashError(msg);
            }).always(() => this.loadingOff);
        } else if ( !data.name ) {
            window.categories[categoryId].senders.push(this);
        }

        return data;
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

    renderTitle(itemContext) {
        let product = itemContext.product,
            price = product.variants[0].price,
            variants = Utils.variants(product, false),
            vLabel = variants.length === 1 ? 'variant' : 'variants',
            category = this.getProductCategory(product, itemContext.singleFilterChannel),
            cTip = this.channelName(itemContext.singleFilterChannel, false, true) + ' category';

        return (
            <Stack distribution="fill" wrap="false">
                <TextStyle variation="strong">{product.title}</TextStyle>
                <Stack distribution="trailing" wrap="false">
                    <Badge status={category && category.category_id ? 'new' : 'warning'}>
                        {category && <span title={cTip}>{category.name || <Spinner size="small"/>}</span>}
                    </Badge>
                    <Badge status="new">
                        <TextStyle variation="positive">{variants.length}{' '}{vLabel}</TextStyle>
                    </Badge>
                    <Badge status="new"><TextStyle variation="positive">${price}</TextStyle></Badge>
                </Stack>
            </Stack>
        )
    }

    renderItem(itemContext) {
        let img = Utils.defaultImage(itemContext.product);

        return (
            <ResourceList.Item
                id={itemContext.product.ecommerce_id}
                media={img ? <Thumbnail source={img.small} alt={itemContext.product.title}/> : ''}
                onClick={this.handleEdit}>

                <Card sectioned title={this.renderTitle(itemContext)}>{this.renderStores(itemContext.product)}</Card>
            </ResourceList.Item>
        );
    }

    renderWithAppContext(appContext) {
        return <ProductContext.Consumer>{(itemContext) => this.renderItem(itemContext)}</ProductContext.Consumer>
    }
}

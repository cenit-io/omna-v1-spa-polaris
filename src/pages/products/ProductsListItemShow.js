import React from 'react';
import {Stack, TextStyle, Card, ResourceList, Thumbnail, Badge} from '@shopify/polaris';
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

    isAvailableChannel(name) {
        return this.activeChannels.find((channel) => channel.name === name)
    }

    renderCategory(item) {
        let storeDetails = (Utils.productItems.storeDetails || []).find((sd) => sd.ecommerce_id === item.ecommerce_id);

        if ( !storeDetails ) return;

        // return (
        //     <Stack distribution="trailing" wrap="false">
        //         <TextStyle variation="positive">
        //             {salesChannels.length === 1 ? 'Sales channel' : 'Sales channels'}:
        //         </TextStyle>;
        //         <Stack distribution="leading" spacing="extraTight" wrap="false">
        //             {salesChannels.map((sch, idx) => this.renderStoreWithStatus(sch, idx))}
        //         </Stack>
        //     </Stack>
        // )
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
        let price = item.variants[0].price,
            variants = Utils.variants(item, false),
            vLabel = variants.length === 1 ? 'variant' : 'variants',
            img = Utils.defaultImage(item),
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
                media={img ? <Thumbnail source={img.small} alt={item.title}/> : ''}
                onClick={this.handleEdit}>

                <Card sectioned title={title}>
                    {this.renderStores(item)}
                    {this.renderCategory(item)}
                </Card>
            </ResourceList.Item>
        );
    }

    renderWithAppContext(appContext) {
        return <ProductContext.Consumer>{(item) => this.renderItem(item)}</ProductContext.Consumer>
    }
}

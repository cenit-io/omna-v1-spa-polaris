import React from 'react';
import {Stack, TextStyle, Card, ResourceList, Thumbnail, Badge, Banner} from '@shopify/polaris';
import {BlogMajorTwotone, CircleTickMajorTwotone} from '@shopify/polaris-icons';
import {Utils} from "../../common/Utils";
import {OMNAComponent} from "../../common/OMNAComponent";
import {PropertyField} from "../../common/PropertyField";
import {ProductContext} from "../../common/ProductContext";
import {PropertyContext} from "../../common/PropertyContext";

export class ProductsListItemBulkEditProperties extends OMNAComponent {
    constructor(props) {
        super(props);

        this.product = null;
        this.singleFilterChannel = null;

        this.handlePropertyChange = this.handlePropertyChange.bind(this);

        this.renderPropertyField = this.renderPropertyField.bind(this);
        this.propertyBulkState = this.propertyBulkState.bind(this);
    }

    get productCategoryId() {
        return this.product['@storeDetails'][Utils.productCategoryAttr(this.singleFilterChannel)];
    }

    get propertiesDefinition() {
        let categoryId = this.productCategoryId,
            channel = this.singleFilterChannel;

        let item = Utils.getPropertiesDefinition(channel, categoryId),
            waitingId = channel + categoryId;

        if ( !item && !Utils.isWaitingResponse(waitingId) ) {
            this.loadingOn();
            Utils.waitResponse(waitingId, (response) => this.setState({ loading: false }));
            this.xhr = $.getJSON({
                url: this.urlTo('properties'),
                data: this.requestParams({ sch: this.singleFilterChannel, category_id: this.productCategoryId })
            }).done((response) => {
                this.propertiesDefinition = response.properties;
                Utils.releaseWaitResponse(waitingId, response);
            }).fail((response) => {
                this.flashError(
                    'Failed to load the properties for ' + channel + ' category. ' + Utils.parseResponseError(response)
                );
                Utils.releaseWaitResponse(waitingId, response);
            }).always(() => this.loadingOff);
        }

        return item;
    }

    set propertiesDefinition(value) {
        Utils.setPropertiesDefinition(this.singleFilterChannel, this.productCategoryId, value);
    }

    handlePropertyChange(pValue, pAttr, pDef, pContext) {
        this.product['@isEdited'] = true;
        this.setState({ isEdited: true });

        if ( this.propertyBulkState(pAttr) ) {
            Utils.productItems.items.forEach(p => {
                if ( p == this.product ) return;

                let propertyContext = this.getPropertyContext(pDef, p['@storeDetails']);

                if ( propertyContext[pAttr] !== pValue && p['@node'].propertyBulkState(pAttr) ) {
                    propertyContext[pAttr] = pValue;
                    p['@isEdited'] = true;
                    p['@node'].setState({ isEdited: true })
                }
            });
        }
    }

    propertyBulkState(pAttr, bulkState) {
        this.product['@bulkPropertyStates'] = this.product['@bulkPropertyStates'] || {};

        let bulkPropertyStates = this.product['@bulkPropertyStates'];

        if ( bulkPropertyStates[pAttr] === undefined ) bulkPropertyStates[pAttr] = false;

        if ( bulkState !== undefined ) bulkPropertyStates[pAttr] = bulkState;

        return bulkPropertyStates[pAttr]
    }

    renderTitle() {
        let price = this.product.variants[0].price,
            variants = Utils.variants(this.product, false),
            vLabel = variants.length === 1 ? 'variant' : 'variants';

        return (
            <Stack distribution="fill" wrap="false">

                <TextStyle variation="strong">{this.product.title}</TextStyle>
                <Stack distribution="trailing" wrap="false">
                    <Badge status="new">
                        <TextStyle variation="positive">{variants.length}{' '}{vLabel}</TextStyle>
                    </Badge>
                    <Badge status="new"><TextStyle variation="positive">${price}</TextStyle></Badge>
                </Stack>
            </Stack>
        )
    }

    getPropertyContext(def, item) {
        let property;

        def.identifier = def.identifier || def.id || def.name;

        item.attributes = item.attributes || [];
        property = item.attributes.find((p) => p.identifier === def.identifier || p.name === def.name);
        property || item.attributes.push(property = { identifier: def.identifier, name: def.name, value: '' });

        return property
    }

    renderPropertyField(prefixId, def, item) {
        let channel = this.singleFilterChannel,
            id = prefixId + '_' + (item.id || item.variant_id || item.ecommerce_id) + '_' + def.name;

        id = id.replace(/\s+/g, '_');

        return (
            <PropertyContext.Provider value={this.getPropertyContext(def, item)} key={id}>
                <PropertyField id={id} definition={def} key={id} store={channel} disabled={this.isWaitingSync}
                               bulkState={this.propertyBulkState} onChange={this.handlePropertyChange}/>
            </PropertyContext.Provider>
        )
    }

    renderProperties() {
        let isEdited = this.state.isEdited,
            pd = this.propertiesDefinition,
            sd = this.product['@storeDetails'],
            channel = this.singleFilterChannel,
            size = { max: 3, multi_select: 1.5 },
            icon = CircleTickMajorTwotone,
            status = 'success';

        if ( isEdited ) {
            icon = BlogMajorTwotone;
            status = 'info';
        }

        if ( !pd ) return Utils.renderLoading('small');

        let groups = Utils.groupProperties(pd.product, size),
            fields = groups.map((g, i) => Utils.renderPropertiesGroup(g, i, sd, channel, this.renderPropertyField));

        return <Banner icon={icon} status={status}>{fields}</Banner>
    }

    renderItem(itemContext) {
        this.product = itemContext.product;
        this.singleFilterChannel = itemContext.singleFilterChannel;

        let img = Utils.defaultImage(this.product);

        return (
            <ResourceList.Item
                id={this.product.ecommerce_id}
                media={img ? <Thumbnail source={img.small} alt={this.product.title}/> : ''}
                onClick={this.handleEdit}>

                <Card sectioned title={this.renderTitle()}>{this.renderProperties()}</Card>
            </ResourceList.Item>
        );
    }

    renderWithAppContext(appContext) {
        return <ProductContext.Consumer>{(itemContext) => this.renderItem(itemContext)}</ProductContext.Consumer>
    }
}

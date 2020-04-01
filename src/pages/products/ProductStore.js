import React from 'react';
import {
    AccountConnection, Avatar, ResourceList, Card, Form, FormLayout, TextField, Button, Checkbox, Stack
} from '@shopify/polaris';
import {OMNAComponent} from '../../common/OMNAComponent';
import {PropertyField} from '../../common/PropertyField'
import {StoreContext} from "../../common/StoreContext";
import {PropertyContext} from '../../common/PropertyContext'
import {NomenclatureSelectBox} from "../../common/NomenclatureSelectBox";
import {Utils} from "../../common/Utils";

export class ProductStore extends OMNAComponent {
    constructor(props) {
        super(props);

        this.state.resetAttrs = true;
        this.state.categoryRequired = true;
        this.state.descriptionAttr = 'description';
        this.state.descriptionRich = true;
        this.state.alreadyLoad = false;
        this.state.product = Utils.productItems.items[props.productIndex];

        this.setStore('None');
    }

    handlePublish = () => {
        const msg = 'Are you sure you want to publish this product in ' + this.store + ' sale channel?';

        Utils.confirm(msg, (confirmed) => {
            if (confirmed) {
                const
                    { product } = this.state,
                    uri = this.urlTo('product/publish'),
                    data = this.requestParams({ sch: this.store, id: product.ecommerce_id, task: 'publish' });

                this.setState({ sending: true });
                this.loadingOn();
                this.xhr = $.post({
                    url: uri,
                    data: JSON.stringify(data),
                    dataType: 'json',
                    contentType: 'application/json',
                    xhrFields: { withCredentials: true }
                }).done((response) => {
                    this.setProduct(response.product, true);
                    this.flashNotice('Product published successfully in ' + this.store);
                }).fail((response) => {
                    this.processFailRequest(response, 'publish')
                }).always(() => {
                    this.loadingOff();
                    this.setState({ sending: false });
                });
            }
        });
    };

    handleUnpublished = () => {
        const msg = 'Are you sure you want to unpublished this product from ' + this.store + ' sale channel?';

        Utils.confirm(msg, (confirmed) => {
            if (confirmed) {
                let { product } = this.state,
                    uri = this.urlTo('product/publish'),
                    data = this.requestParams({ sch: this.store, id: product.ecommerce_id, task: 'unpublished' });

                this.setState({ sending: true });
                this.loadingOn();
                this.xhr = $.post({
                    url: uri,
                    data: JSON.stringify(data),
                    dataType: 'json',
                    contentType: 'application/json',
                    xhrFields: { withCredentials: true }
                }).done((response) => {
                    this.setProduct(response.product, true);
                    this.flashNotice('Product unpublished successfully from ' + this.store);
                }).fail((response) => {
                    this.processFailRequest(response, 'unpublished')
                }).always(() => {
                    this.loadingOff();
                    this.setState({ sending: false });
                });
            }
        });
    };

    handleSubmit = () => {
        if (this.isNotValid) return this.flashError('Please first complete all the required fields...!');

        let { storeDetails, sending } = this.state,
            uri = this.urlTo('product/update'),
            data = this.requestParams({
                sch: this.store,
                id: storeDetails.ecommerce_id,
                product: storeDetails
            });

        this.setState({ sending: true });
        this.loadingOn();

        this.xhr = $.post({
            url: uri,
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json',
            xhrFields: { withCredentials: true }
        }).done((response) => {
            this.setStoreDetails(response);
            this.flashNotice('The product synchronization process with ' + this.store + ' has been started');
            scrollTo(0, 0)
        }).fail((response) => {
            this.processFailRequest(response, 'update')
        }).always(() => {
            this.loadingOff();
            sending && this.setState({ sending: false });
        });
    };

    handleCategoryChange = (value) => {
        this.setState((prevState) => {
            let vAttr = Utils.productVariantsAttr(this.store),
                cAttr = Utils.productCategoryAttr(this.store);

            prevState.storeDetails[cAttr] = value;

            // Clear previews attrs
            if (prevState.resetAttrs) {
                prevState.storeDetails.attributes = [];
                prevState.storeDetails[vAttr] = prevState.storeDetails[vAttr] || [];
                prevState.storeDetails[vAttr].forEach((v) => v.attributes = []);
            }

            return prevState;
        });
    };

    handleUsingSameDescription = (value) => {
        const { product, descriptionAttr, descriptionRich } = this.state;

        this.setState((prevState) => {
            if (value) {
                prevState.storeDetails[descriptionAttr] = descriptionRich ? product.body_html : $('<div>' + product.body_html + '</div>').text();
            }

            prevState.storeDetails.using_same_description = value;

            return prevState;
        });
    };

    processFailRequest(response, action) {
        let error = Utils.parseResponseError(response);

        error = error || '(' + response.state() + ')';

        this.flashError('Failed to ' + action + ' the product in ' + this.store + ' sales channel. ' + error);
    }

    setStore(store) {
        if (this.store !== store) {
            this.abortPreviousTask();
            this.store = store;
            this.state.storeDetails = null;
            this.state.syncTask = null;
            this.state.notifications = [];
            this.state.alreadyLoad = false;
            this.state.sending = false;
        }
    }

    get storeName() {
        return this.channelName(this.store, false, true)
    }

    get storeSettings() {
        return this.channels[this.store]
    }

    setProduct(product, setInState) {
        const productItems = Utils.productItems;

        productItems.items[Utils.getProductIndex(product)] = product;

        Utils.productItems = productItems;
        setInState && this.setState({ product: product });
    }

    setStoreDetails(data) {
        let { descriptionAttr } = this.state,
            { sch_product, product, notifications, sync_task } = data;

        if (sch_product) sch_product[descriptionAttr] = sch_product[descriptionAttr] || product.body_html || '';

        this.setProduct(product, false);

        this.setState({
            product: product,
            storeDetails: sch_product,
            definedCategory: sch_product ? sch_product[Utils.productCategoryAttr(this.store)] : null,
            notifications: notifications,
            syncTask: sync_task,
            alreadyLoad: true,
            sending: false
        });
    }

    getPropertyContext(def, item) {
        let property;

        def.identifier = def.identifier || def.id || def.name;

        item.attributes = item.attributes || [];
        property = item.attributes.find((p) => p.identifier === def.identifier || p.name === def.name);
        property || item.attributes.push(property = { identifier: def.identifier, name: def.name, value: '' });

        return property
    }

    get isWaitingSync() {
        const { syncTask, storeDetails, sending } = this.state;

        return sending || !storeDetails || syncTask && (syncTask.status === 'pending' || syncTask.status == 'running')
    }

    get category() {
        const { storeDetails } = this.state;

        return storeDetails ? storeDetails[Utils.productCategoryAttr(this.store)] : null
    }

    get canUpdateCategory() {
        return !this.state.definedCategory
    }

    get isNotValid() {
        return false;
    }

    get propertiesDefinition() {
        return Utils.getPropertiesDefinition(this.store, this.category);
    }

    set propertiesDefinition(value) {
        Utils.setPropertiesDefinition(this.store, this.category, value);
    }

    loadPropertiesDefinition() {
        let uri = this.urlTo('properties'),
            data = this.requestParams({ sch: this.store, category_id: this.category });

        $.getJSON({
            url: uri,
            data: data,
            xhrFields: { withCredentials: true }
        }).done((response) => {
            this.propertiesDefinition = response.properties;
            this.setState({ error: false });
        }).fail((response) => {
            let msg = 'Failed to load the properties for ' + this.storeName + ' category. ' + Utils.parseResponseError(response);

            this.flashError(msg);
            this.setState({ error: msg });
        }).always(this.loadingOff);

        return Utils.renderLoading();
    }

    loadStoreDetails = () => {
        let data = this.requestParams({ sch: this.store, id: this.state.product.ecommerce_id }),
            uri = this.urlTo('product/show');

        this.loadingOn();
        this.xhr = $.getJSON({
            url: uri,
            data: data,
            xhrFields: { withCredentials: true }
        }).done((response) => {
            this.setStoreDetails(response);
        }).fail((response) => {
            this.processFailRequest(response, 'load')
        }).always(this.loadingOff);

        return Utils.renderLoading();
    };

    renderCategory() {
        const { storeDetails } = this.state;

        return <NomenclatureSelectBox entity="Category" store={this.store} idAttr="category_id"
                                      id={this.store + '-' + storeDetails.ecommerce_id + '-category'}
                                      value={this.category} disabled={this.isWaitingSync || !this.canUpdateCategory}
                                      className="category-select-box"
                                      onChange={this.handleCategoryChange}/>
    }

    renderWaitingSync(msg1, msg2) {
        if (this.isWaitingSync) {
            this.timeoutHandle = setTimeout(this.loadStoreDetails, 10000);

            return (
                <Card.Section subdued>{Utils.warn(msg1)}{Utils.info(msg2)}</Card.Section>
            )
        }
    }

    renderForm() {
        const { sending } = this.state;

        return (
            <Form onSubmit={this.handleSubmit}>
                {
                    this.renderWaitingSync(
                        'This product is in a synchronization process with the ' + this.storeName + ' sale channel.',
                        'The form with the product details will be enabled again when this process has been completed.'
                    )
                }
                <Card.Section subdued title="Category">
                    {this.renderCategory()}
                </Card.Section>
                <Card.Section subdued title="Properties">
                    <FormLayout>{this.renderProperties()}</FormLayout>
                </Card.Section>
                <Card.Section subdued title="Variants">
                    {this.renderVariants(true)}
                </Card.Section>
                <Card.Section subdued>
                    <Stack distribution="trailing" wrap="false">
                        <Button submit disabled={sending || this.isWaitingSync} primary>Submit</Button>
                    </Stack>
                </Card.Section>
            </Form>
        )
    }

    renderOptionValues(sfyVariant) {
        const fields = sfyVariant.option_values.map(
            (ov, idx) => <TextField type="text" disabled={true} value={ov.value} label={ov.name} key={idx}/>
        );

        return <FormLayout.Group>{fields}</FormLayout.Group>
    }

    renderStaticPropertyField(def) {
        const { storeDetails } = this.state;

        def.valueAttr = def.valueAttr || def.name;

        return <PropertyField id={this.store + '_' + storeDetails.ecommerce_id + '_' + def.name} definition={def}
                              store={this.store}
                              disabled={def.disabled || this.isWaitingSync}/>
    }

    renderPropertyDescription() {
        const { storeDetails, descriptionAttr, descriptionRich } = this.state;

        return (
            <Card sectioned>
                <Stack distribution="trailing">
                    <Checkbox label="Using the same Shopify description." onChange={this.handleUsingSameDescription}
                              checked={storeDetails.using_same_description}/>
                </Stack>
                <FormLayout.Group>
                    {
                        this.renderStaticPropertyField({
                            type: descriptionRich ? 'rich_text' : 'text',
                            name: descriptionAttr,
                            label: 'Description',
                            rows: 15,
                            disabled: storeDetails.using_same_description,
                            required: true
                        })
                    }
                </FormLayout.Group>
            </Card>
        )
    }

    renderStaticProperties() {
        return (
            <PropertyContext.Provider value={this.state.storeDetails}>
                {this.renderPropertyDescription()}
            </PropertyContext.Provider>
        )
    }

    renderCategoryProperties() {
        const propertiesDefinition = this.propertiesDefinition;

        if (!propertiesDefinition) return this.loadPropertiesDefinition();

        if (propertiesDefinition.product.length === 0) return Utils.info(
            'This product does not have specific properties in this sales channel.'
        );

        let groups = Utils.groupProperties(propertiesDefinition.product),
            storeDetails = this.state.storeDetails,
            fields = groups.map((group, gIdx) => {
                return Utils.renderPropertiesGroup(group, gIdx, storeDetails, this.store, this.renderPropertyField)
            });

        return <Card sectioned>{fields}</Card>
    }

    renderCustomProperties() {
        // Abstract method
    }

    renderPropertyField = (prefixId, def, item) => {
        let id = prefixId + '_' + (item.id || item.variant_id || item.ecommerce_id) + '_' + def.name;

        id = id.replace(/\s+/g, '_');

        return (
            <PropertyContext.Provider value={this.getPropertyContext(def, item)} key={id}>
                <PropertyField id={id} definition={def} key={id} store={this.store} disabled={this.isWaitingSync}/>
            </PropertyContext.Provider>
        )
    };

    renderProperties() {
        const { error, categoryRequired } = this.state;

        if (error) return Utils.error(error);

        if (categoryRequired && !this.category) return Utils.warn(
            'The properties of this product can not be defined until product category has been defined.'
        );

        return (
            <div>
                {this.renderStaticProperties()}
                {this.renderCategoryProperties()}
                {this.renderCustomProperties()}
            </div>
        )
    }

    renderStoreDetails() {
        const { storeDetails, alreadyLoad } = this.state;

        if (!alreadyLoad) return this.loadStoreDetails();
        if (storeDetails) return this.renderForm();

        return this.renderWaitingSync(
            'This product is in the process of being mapped for synchronization with the ' + this.storeName + ' sales channel.',
            'The form with the product details will be displayed when this process has been completed.'
        )
    }

    renderReadOnlyAtts(variant) {
        return (
            <FormLayout.Group>
                <TextField type="text" disabled={true} value={variant.sku} label="SKU"/>
                <TextField type="text" disabled={true} value={variant.barcode} label="Barcode"/>
                <TextField type="text" disabled={true} value={'$' + variant.price} label="Price"/>
            </FormLayout.Group>
        )
    }

    renderItem = (variant) => {
        let media,
            images = Utils.images(variant),
            title = variant.title === 'Default Title' ? null : variant.title;

        if (images.length > 0) {
            media = <Avatar size="large" customer={false} source={images[0].small}/>;
        } else {
            media = <Avatar size="large" customer={false} initials="N"/>;
        }

        return (
            <ResourceList.Item id={variant.id} media={media}>
                <Card sectioned title={title}>
                    <FormLayout>
                        {this.renderReadOnlyAtts(variant)}
                        {this.renderOptionValues(variant)}
                    </FormLayout>
                </Card>
            </ResourceList.Item>
        );
    };

    renderVariants(includeDefault) {
        let product = this.state.product,
            variants = Utils.variants(product, includeDefault);

        if (variants.length > 0) {
            return (
                <ResourceList
                    resourceName={{ singular: 'variant', plural: 'variants' }}
                    items={variants}
                    renderItem={this.renderItem}
                />
            );
        } else {
            return Utils.info('This product does not have variants.');
        }
    }

    renderWithStoreContext(store) {
        this.setStore(store);

        let { product, sending, notifications } = this.state,
            salesChannels = product.sales_channels || [],
            connected = !this.isInactive && salesChannels.find((sc) => sc.channel === store),
            msg = 'The synchronization of this product with the ' + this.storeName + ' sales channel is ',
            statusDetails = connected ? Utils.success(msg + 'enabled.') : Utils.warn(msg + 'disabled.');

        return (
            <div className={"product sale-channel " + store}>
                <AccountConnection
                    title={product.title}
                    connected={connected}
                    details={statusDetails}
                    accountName={store}
                    action={{
                        content: connected ? 'Disable' : 'Enable',
                        onAction: this[connected ? 'handleUnpublished' : 'handlePublish'],
                        destructive: connected,
                        icon: connected ? 'cancelSmall' : 'checkmark',
                        disabled: this.isInactive || sending
                    }}
                />
                {connected && Utils.renderNotifications(notifications)}
                {connected && (<Card sectioned title="Details">{this.renderStoreDetails()}</Card>)}
            </div>
        );
    }

    renderWithAppContext(appContext) {
        return <StoreContext.Consumer>{(store) => this.renderWithStoreContext(store)}</StoreContext.Consumer>
    }
}
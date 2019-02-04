import React from 'react';
import {
    AccountConnection, Avatar, ResourceList, Card, Form, FormLayout, TextField, Button, Checkbox, Stack
} from '@shopify/polaris';
import {OMNAComponent} from '../../common/OMNAComponent';
import {PropertyField} from '../../common/PropertyField'
import {StoreContext} from "../../common/StoreContext";
import {PropertyContext} from '../../common/PropertyContext'
import {NomenclatureSelectBox} from "../../common/NomenclatureSelectBox";

export class ProductStore extends OMNAComponent {
    constructor(props) {
        super(props);

        this.state.resetAttrs = true;
        this.state.categoryAttr = 'category';
        this.state.categoryRequired = true;
        this.state.variantsAttr = 'variants';
        this.state.descriptionAttr = 'description';
        this.state.descriptionRich = true;
        this.state.alreadyLoad = false;
        this.state.product = this.productItems.items[props.productIndex];

        this.setStore('None');

        this.handleBrand = this.handleBrand.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePublish = this.handlePublish.bind(this);
        this.handleUnpublished = this.handleUnpublished.bind(this);
        this.handleFailRequest = this.handleFailRequest.bind(this);
        this.handleCategoryChange = this.handleCategoryChange.bind(this);
        this.handleUsingSameDescription = this.handleUsingSameDescription.bind(this);
        this.loadStoreDetails = this.loadStoreDetails.bind(this);
    }

    setStore(store) {
        if ( this.store !== store ) {
            this.store = store;
            this.state.storeDetails = null;
            this.state.syncTask = null;
            this.state.notifications = [];
            this.state.alreadyLoad = false;
            this.state.sending = false;
        }
    }

    handlePublish() {
        const msg = 'Are you sure you want to publish this porduct in ' + this.store + ' sale channel?';

        this.confirm(msg, (confirmed) => {
            if ( confirmed ) {
                const
                    { product } = this.state,
                    uri = this.urlTo('product/publish'),
                    data = this.requestParams({ sch: this.store, id: product.ecommerce_id, task: 'publish' });

                this.setState({ sending: true });
                this.loadingOn();
                this.xhr = $.post(uri, data, 'json').done((response) => {
                    this.setProduct(response.product);
                    this.flashNotice('Product published successfully in ' + this.store);
                }).fail((response) => {
                    this.handleFailRequest(response, 'publish')
                }).always(() => {
                    this.loadingOff();
                    this.setState({ sending: false });
                });
            }
        });
    }

    handleUnpublished() {
        const msg = 'Are you sure you want to unpublished this porduct from ' + this.store + ' sale channel?';

        this.confirm(msg, (confirmed) => {
            if ( confirmed ) {
                const
                    { product } = this.state,
                    uri = this.urlTo('product/publish'),
                    data = this.requestParams({ sch: this.store, id: product.ecommerce_id, task: 'unpublished' });

                this.setState({ sending: true });
                this.loadingOn();
                this.xhr = $.post(uri, data, 'json').done((response) => {
                    this.setProduct(response.product);
                    this.flashNotice('Product unpublished successfully from ' + this.store);
                }).fail((response) => {
                    this.handleFailRequest(response, 'unpublished')
                }).always(() => {
                    this.loadingOff();
                    this.setState({ sending: false });
                });
            }
        });
    }

    handleSubmit() {
        if ( this.isNotValid ) return this.flashError('Please first complete all the required fields...!');

        const
            { storeDetails, sending } = this.state,
            uri = this.urlTo('product/update'),
            data = this.requestParams({
                sch: this.store,
                id: storeDetails.ecommerce_id,
                product: JSON.stringify(storeDetails)
            });

        this.setState({ sending: true });
        this.loadingOn();

        this.xhr = $.post(uri, data).done((response) => {
            this.setStoreDetails(response);
            this.flashNotice('The product synchronization process with ' + this.store + ' has been started');
            scrollTo(0, 0)
        }).fail((response) => {
            this.handleFailRequest(response, 'update')
        }).always(() => {
            this.loadingOff();
            sending && this.setState({ sending: false });
        });
    }

    handleFailRequest(response, action) {
        let error = response.responseJSON ? response.responseJSON.error : response.responseText

        error = error || '(' + response.state() + ')';

        this.flashError('Failed to ' + action + ' the product in ' + this.store + ' sales channel. ' + error);
    }

    handleCategoryChange(value) {
        this.setState((prevState) => {
            const
                vAttr = prevState.variantsAttr,
                cAttr = prevState.categoryAttr;

            prevState.storeDetails[cAttr] = value;

            // Clear previews attrs
            if ( prevState.resetAttrs ) {
                prevState.storeDetails.attributes = [];
                prevState.storeDetails[vAttr] = prevState.storeDetails[vAttr] || [];
                prevState.storeDetails[vAttr].forEach((v) => v.attributes = []);
                prevState.propertiesDefinition = null;
            }

            return prevState;
        });
    }

    handleBrand(value) {
        // Abstract method.
    }

    handleUsingSameDescription(value) {
        const { product, descriptionAttr, descriptionRich } = this.state;

        this.setState((prevState) => {
            if ( value ) {
                let desc = descriptionRich ? product.body_html : $('<div>' + product.body_html + '</div>').text();

                prevState.storeDetails[descriptionAttr] = desc;
            }

            prevState.storeDetails.using_same_description = value;

            return prevState;
        });
    }

    get channel() {
        return this.channels[this.store]
    }

    setProduct(product) {
        super.setProduct(product);
        this.setState({ product: product });
    }

    setStoreDetails(data) {
        const { descriptionAttr } = this.state;
        const { sch_product, product, notifications, sync_task } = data;

        if ( sch_product ) sch_product[descriptionAttr] = sch_product[descriptionAttr] || product.body_html || '';

        super.setProduct(product);

        this.setState({
            product: product,
            storeDetails: sch_product,
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
        const { storeDetails, categoryAttr } = this.state;

        return storeDetails ? storeDetails[categoryAttr] : null
    }

    get canUpdateCategory() {
        return !this.category
    }

    get isNotValid() {
        return false;
    }

    get propertiesDefinitions() {
        return this.getSessionItem('propertiesDefinitions', {})[this.store] || {}
    }

    set propertiesDefinitions(value) {
        const pds = this.getSessionItem('propertiesDefinitions', {});

        pds[this.store] = value;

        this.setSessionItem('propertiesDefinitions', pds)
    }

    get propertiesDefinition() {
        return this.propertiesDefinitions[this.category];
    }

    set propertiesDefinition(value) {
        const pds = this.propertiesDefinitions;

        value.accessAt = Date.now();

        pds[this.category] = value;

        { // Save properties definitions of only 5 categories.
            const keys = Object.keys(pds);

            if ( keys.length > 5 ) {
                var k1 = keys.shift();

                keys.forEach((k2) => k1 = (pds[k1].accessAt > pds[k2].accessAt) ? k2 : k1);

                delete pds[k1];
            }
        }

        this.propertiesDefinitions = pds;
    }

    loadPropertiesDefinition() {
        const
            store = this.store,
            propertiesDefinition = this.propertiesDefinition;

        if ( propertiesDefinition ) {
            console.debug('Properties definition loaded from local store.');
            setTimeout(() => this.setState({ propertiesDefinition: propertiesDefinition, error: false }), 0);
            this.propertiesDefinition = propertiesDefinition;
        } else {
            const
                uri = this.urlTo('properties'),
                data = this.requestParams({ sch: store, category_id: this.category });

            $.getJSON(uri, data).done((response) => {
                this.propertiesDefinition = response.properties;
                this.setState({ propertiesDefinition: response.properties, error: false });
            }).fail((response) => {
                const msg = 'Failed to load the properties for ' + store + ' category. ' + response.responseJSON.error;

                this.flashError(msg);
                this.setState({ error: msg });
            }).always(() => this.loadingOff());
        }
        return this.renderLoading();
    }

    loadStoreDetails() {
        let data = this.requestParams({ sch: this.store, id: this.state.product.ecommerce_id }),
            uri = this.urlTo('product/show');

        this.loadingOn();
        this.xhr = $.getJSON(uri, data).done((response) => {
            this.setStoreDetails(response);
        }).fail((response) => {
            this.handleFailRequest(response, 'load')
        }).always(() => this.loadingOff());

        return this.renderLoading();
    }

    groupProperties(propertiesDefinition) {
        let l, ct, pt, r = /rich_text|multi_select/, groups = [];

        propertiesDefinition.forEach((pd) => {
            l = groups.length;
            ct = pd.type || 'text';
            pt = l > 0 ? groups[l - 1][0].type : 'text';
            pt = pt || 'text';

            if ( l === 0 || ct.match(r) || groups[l - 1].length === 2 || pt.match(r) ) {
                groups.push([pd]);
            } else {
                groups[l - 1].push(pd);
            }
        });

        return groups;
    }

    renderCategory() {
        const { storeDetails } = this.state;

        return <NomenclatureSelectBox entity="Category" store={this.store} idAttr="category_id"
                                      id={this.store + '-' + storeDetails.ecommerce_id + '-category'}
                                      value={this.category} disabled={this.isWaitingSync || !this.canUpdateCategory}
                                      className="category-select-box"
                                      onChange={this.handleCategoryChange}/>
    }

    renderWaitingSync(msg1, msg2) {
        if ( this.isWaitingSync ) {
            this.timeoutHandle = setTimeout(this.loadStoreDetails, 10000);

            return (
                <Card.Section subdued>{this.warn(msg1)}{this.info(msg2)}</Card.Section>
            )
        }
    }

    renderForm() {
        const { sending } = this.state;

        return (
            <Form onSubmit={this.handleSubmit}>
                {
                    this.renderWaitingSync(
                        'This product is in a synchronization process with the ' + this.store + ' store.',
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
        const { propertiesDefinition } = this.state;

        if ( !propertiesDefinition ) return this.loadPropertiesDefinition();

        if ( propertiesDefinition.product.length === 0 ) return this.info(
            'This product does not have specific properties in this sales channel.'
        );

        const groups = this.groupProperties(propertiesDefinition.product);

        return (
            <Card sectioned>
                {groups.map((group, gIdx) => this.renderPropertiesGroup(group, gIdx))}
            </Card>
        )
    }

    renderCustomProperties() {
        // Abstract method
    }

    renderPropertyField(prefixId, def, item) {
        let id = prefixId + '_' + (item.id || item.variant_id || item.ecommerce_id) + '_' + def.name;

        id = id.replace(/\s+/g, '_');

        return (
            <PropertyContext.Provider value={this.getPropertyContext(def, item)} key={id}>
                <PropertyField id={id} definition={def} key={id} store={this.store}
                               disabled={this.isWaitingSync}/>
            </PropertyContext.Provider>
        )
    }

    renderPropertiesGroup(group, gIdx, item) {
        let title, context, items,
            prefixId = this.store + '_' + gIdx + '_';

        item = item || this.state.storeDetails;

        if ( !Array.isArray(group) ) {
            title = group.title;
            item = group.context ? item[group.context] : item;
            if ( Array.isArray(item) && group.allowAdd ) item.push({ __toAdd__: true });
            group = group.properties;
        }

        items = Array.isArray(item) ? item : [item];

        context = items.map((item, iIdx) => (
            <FormLayout.Group key={prefixId + iIdx}>
                {group.map((def, pIdx) => this.renderPropertyField(prefixId + iIdx + '_' + pIdx, def, item))}
            </FormLayout.Group>
        ));

        return title ? <Card sectioned title={title} key={gIdx}>{context}</Card> : context
    }

    renderProperties() {
        const { error, categoryRequired } = this.state;

        if ( error ) return this.error(error);

        if ( categoryRequired && !this.category ) return this.warn(
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

        if ( !alreadyLoad ) return this.loadStoreDetails();
        if ( storeDetails ) return this.renderForm();

        return this.renderWaitingSync(
            'This product is in the process of being mapped for synchronization with the ' + this.store + ' sales channel.',
            'The form with the product details will be displayed when this process has been completed.'
        )
    }

    renderVariants(includeDefault) {
        const
            product = this.state.product,
            variants = this.variants(product, includeDefault);

        if ( variants.length > 0 ) {
            return (
                <ResourceList
                    resourceName={{ singular: 'variant', plural: 'variants' }}
                    items={variants}
                    renderItem={(variant) => {
                        var media,
                            images = this.images(variant),
                            title = variant.title === 'Default Title' ? null : variant.title;

                        if ( images.length > 0 ) {
                            media = <Avatar size="large" customer={false} source={images[0].small}/>;
                        } else {
                            media = <Avatar size="large" customer={false} initials="N"/>;
                        }

                        return (
                            <ResourceList.Item id={variant.id} media={media}>
                                <Card sectioned title={title}>
                                    <FormLayout>
                                        <FormLayout.Group>
                                            <TextField type="text" disabled={true} value={variant.sku}
                                                       label="SKU"/>
                                            <TextField type="text" disabled={true} value={variant.barcode}
                                                       label="Barcode"/>
                                            <TextField type="text" disabled={true} value={'$' + variant.price}
                                                       label="Price"/>
                                        </FormLayout.Group>
                                        {this.renderOptionValues(variant)}
                                    </FormLayout>
                                </Card>
                            </ResourceList.Item>
                        );
                    }}
                />
            );
        } else {
            return this.info('This product does not have variants.');
        }
    }

    renderWithStoreContext(store) {
        const
            { product, sending, notifications } = this.state,
            salesChannels = product.sales_channels || [],
            connected = !this.isInactive && salesChannels.find((sc) => sc.channel === store),
            msg = 'The synchronization of this product with the ' + store + ' sales channel is ',
            statusDetails = connected ? this.success(msg + 'enabled.') : this.warn(msg + 'disabled.');

        this.setStore(store);

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
                {connected && this.renderNotifications(notifications)}
                {connected && (<Card sectioned title="Details">{this.renderStoreDetails()}</Card>)}
            </div>
        );
    }

    renderWithAppContext(appContext) {
        return <StoreContext.Consumer>{(store) => this.renderWithStoreContext(store)}</StoreContext.Consumer>
    }

    componentWillUnmount() {
        if ( this.timeoutHandle ) clearTimeout(this.timeoutHandle);
        if ( this.xhr && this.xhr.readyState != 4 ) this.xhr.abort();
    }
}
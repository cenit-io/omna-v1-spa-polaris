import React from 'react';
import {
    AccountConnection, Avatar, ResourceList, Card, Form, FormLayout, TextField, Button, Labelled, Stack
} from '@shopify/polaris';
import {OMNAComponent} from './Commons';

export class RichText extends OMNAComponent {
    render() {
        const { id, label, value, error } = this.props;

        return (
            <div className={'rich-text-box' + (error ? ' error' : '')}>
                <Labelled id={id}>{label}</Labelled>
                <textarea id={id} style={{ width: '100%' }} defaultValue={value}/>
                <Labelled error={error}/>
            </div>
        )
    }

    componentDidMount() {
        const selector = '#' + this.props.id;

        tinymce.init({
            selector: selector,
            setup: function (editor) {
                editor.on('change', () => this.props.onChange(editor.save()));
            }.bind(this)
        });
    }

    componentWillUnmount() {
        tinymce.remove('#' + this.props.id);
    }
}

export class NomenclatureSelectBox extends OMNAComponent {
    constructor(props) {
        super(props);

        this.state = {
            idAttr: this.props.idAttr || 'name',
            textAttr: this.props.textAttr || 'name',
            entity: 'Nomenclature',
            className: 'nomenclature-select-box'
        };
    }

    onChange(e) {
        this.props.onChange($(e.target).val());
    }

    componentDidMount() {
        const
            { entity, idAttr, textAttr } = this.state,
            { id, store } = this.props,
            uri = this.urlTo('nomenclatures');

        var selector = '#' + id;

        $(selector).select2({
            initSelection: function (element, callback) {
                var value = element.val();

                if ( value ) {
                    if ( this.props.tags ) return callback({ id: value, text: value });

                    if ( this.cacheItems ) {
                        var item = this.cacheItems.find(function (item) {
                            return item[idAttr] == value
                        });

                        if ( item ) return callback(item);
                    }

                    const params = this.requestParams({
                        entity: entity, sch: store, id: value, idAttr: idAttr, textAttr: textAttr
                    });

                    return $.getJSON(uri, params, function (data) {
                        return data.item ? callback({ id: data.item[idAttr], text: data.item[textAttr] }) : null;
                    });
                }
            }.bind(this),

            ajax: {
                url: uri,
                dataType: 'json',
                data: function (params) {
                    params.page = params.page || 1;

                    return this.requestParams({
                        entity: entity, sch: store, idAttr: idAttr, textAttr: textAttr,
                        q: { p: params.page, s: params.term }
                    });
                }.bind(this),

                processResults: function (data, params) {
                    var items = data.items.map(function (item) {
                        return { id: item[idAttr], text: item[textAttr] }
                    });
                    params.page = params.page || 1;
                    this.cacheItems = items;

                    return { results: items, pagination: { more: params.page < data.pages } };
                }.bind(this)
            }
        });

        $(selector).on('change', this.onChange.bind(this));
    }

    render() {
        const { id, label, value, disabled, tags, error } = this.props;

        return (
            <div className={this.state.className + (error ? ' error' : '')}>
                {label ? <Labelled id={id}>{label}</Labelled> : null}
                <select id={id} defaultValue={value} data-tags={tags} style={{ width: '100%' }} disabled={disabled}>
                    {value ? <option value={value}>{value}</option> : null}
                </select>
                <Labelled error={error}/>
            </div>
        )
    }
}

export class CategorySelectBox extends NomenclatureSelectBox {
    constructor(props) {
        super(props);

        this.state.entity = 'Category';
        this.state.idAttr = 'category_id';
        this.state.className = 'category-select-box';
    }
}

export class BrandSelectBox extends NomenclatureSelectBox {
    constructor(props) {
        super(props);

        this.state.entity = 'Brand';
        this.state.className = 'brand-select-box';
    }
}

export class PropertySelectBox extends OMNAComponent {
    onChange(e) {
        this.props.onChange($(e.target).val());
    }

    parseOptions() {
        return this.props.options.map((o) => {
            if ( typeof o == 'object' ) return {
                label: o.label || o.text || o.name || o.value,
                value: o.value || o.id || o.name
            };

            return { label: o, value: o }
        });
    }

    render() {
        const
            { id, label, value, multiple, tags } = this.props,
            selOpts = multiple && !$.isArray(value) ? (value || '').split(',') : value,
            options = this.parseOptions();

        return (
            <div className="property-select-box">
                <Labelled id={id}>{label}</Labelled>
                <select id={id} style={{ width: '100%' }} multiple={multiple} data-tags={tags} defaultValue={selOpts}>
                    {options.map((o, idx) => <option value={o.value} key={idx}>{o.label}</option>)}
                </select>
            </div>
        )
    }

    componentDidMount() {
        const selector = '#' + this.props.id;

        $(selector).select2();
        $(selector).on('change', this.onChange.bind(this));
        $(selector).change();
    }
}

export class PropertyField extends OMNAComponent {
    constructor(props) {
        super(props);

        this.getSelectOptions = this.getSelectOptions.bind(this);
        this.handleChangeValue = this.handleChangeValue.bind(this);

        this.state.property = this.props.property;
    }

    getSelectOptions() {
        return this.props.definition.options.map((o) => {
            if ( typeof o == 'object' ) return {
                label: o.label || o.text || o.name || o.value,
                value: o.value || o.id || o.name
            };

            return { label: o, value: o }
        });
    }

    isNotValid(value) {
        const
            { type, required, valueAttr } = this.props.definition,
            { property } = this.state;

        if ( value === undefined ) value = property[valueAttr || 'value'];
        if ( type == 'rich_text' ) value = $(value).text();

        if ( required && (value === undefined || value === null || String(value).match(/^\s*$/)) ) {
            return 'This field is required';
        }
    }

    handleChangeValue(value) {
        const { valueAttr } = this.props.definition;

        this.setState((prevState) => {
            prevState.property[valueAttr || 'value'] = value;
            prevState.error = this.isNotValid();
            return prevState;
        });
    }

    render() {
        const
            { type, label, required, name, valueAttr, min, max, tags, idAttr } = this.props.definition,
            { id, store } = this.props,

            value = this.state.property[valueAttr || 'value'],
            error = this.isNotValid(),
            rLabel = (label || name) + (required ? ' *' : '');

        if ( type == 'brand' || name == 'brand' ) {
            return <BrandSelectBox label={rLabel} value={value} id={id} error={error}
                                   tags={store == 'Lazada' ? true : tags}
                                   idAttr={idAttr} store={store} onChange={this.handleChangeValue}/>;
        }

        switch ( type ) {
            case 'rich_text':
                return (
                    <RichText label={rLabel} value={value} id={id} error={error} onChange={this.handleChangeValue}/>
                );

            case 'text':
                return (
                    <TextField type="text" label={rLabel} value={value} id={id} error={error} minLength={min}
                               maxLength={max}
                               onChange={this.handleChangeValue}
                    />
                );

            case 'numeric':
                return (
                    <TextField type="number" label={rLabel} value={value} id={id} error={error} min={min} max={max}
                               onChange={this.handleChangeValue}
                    />
                );

            case 'single_select':
                return (
                    <PropertySelectBox label={rLabel} value={value} id={id} required={required} error={error}
                                       tags={tags}
                                       onChange={this.handleChangeValue}
                                       options={this.getSelectOptions()}
                    />
                );

            case 'multi_enum_input':
                return (
                    <PropertySelectBox label={rLabel} value={value} id={id} required={required} error={error}
                                       tags={true}
                                       onChange={this.handleChangeValue}
                                       options={this.getSelectOptions()}
                    />
                );

            case 'multi_select':
                return (
                    <PropertySelectBox label={rLabel} value={value} id={id} multiple={true} required={required}
                                       tags={tags}
                                       onChange={this.handleChangeValue}
                                       options={this.getSelectOptions()}
                    />
                );

            default:
                return <TextField type={type} label={rLabel} value={value} id={id} error={error} min={min} max={max}
                                  onChange={this.handleChangeValue}/>;
        }
    }
}

export class ProductStore extends OMNAComponent {
    constructor(props) {
        super(props);

        this.state.alreadyLoad = false;
        this.state.sending = false;
        this.state.categoryAttribute = 'category';

        this.handleBrand = this.handleBrand.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePublish = this.handlePublish.bind(this);
        this.handleUnpublish = this.handleUnpublish.bind(this);

        this.renderStoreDetails = this.renderStoreDetails.bind(this);
        this.loadStoreDetails = this.loadStoreDetails.bind(this);
    }

    setProduct(product) {
        this.props.parent.setProduct(product);
    }

    setStoreDetails(data) {
        const { sch_product, notifications } = data;

        this.setState({
            storeDetails: sch_product,
            notifications: notifications,
            canUpdateCategory: sch_product ? this.canUpdateCategory(sch_product) : true,
            alreadyLoad: true
        });
    }

    getProperty(name, item) {
        var property;

        item.attributes = item.attributes || [];
        property = item.attributes.find(function (p) {
            return p.name == name;
        });
        property || item.attributes.push(property = { name: name, value: '' });

        return property
    }

    canUpdateCategory(sPD) {
        return true;
    }

    isNotValid() {
        return false;
    }

    loadStoreDetails(store, product) {
        const
            data = this.requestParams({ sch: store, id: product.product_id }),
            uri = this.urlTo('product/show');

        this.loadingOn();
        $.getJSON(uri, data).done(function (response) {
            window.sd = response
            this.setStoreDetails(response);
        }.bind(this)).fail(function (response) {
            const error = response.responseJSON ? response.responseJSON.error : '';
            this.flashError('Failed to load the product from ' + store + ' sales channel. ' + error);
        }.bind(this)).always(function () {
            this.loadingOff();
        }.bind(this));
    }

    handlePublish() {
        const msg = 'Are you sure you want to publish this porduct in ' + this.state.store + ' sale channel?';

        this.confirm(msg, function (confirmed) {
            if ( confirmed ) {
                const
                    { store } = this.state,
                    { product } = this.props,
                    uri = this.urlTo('product/update'),
                    data = this.requestParams({ sch: store, id: product.product_id, task: 'publish' });

                this.setState({ sending: true });
                this.loadingOn();
                $.post(uri, data, 'json').done(function (response) {
                    this.setProduct(response.product);
                    this.flashNotice('Product published successfully in ' + store);
                }.bind(this)).fail(function (response) {
                    const error = response.responseJSON ? response.responseJSON.error : '';
                    this.flashError('Failed to publish the product in ' + store + '. ' + error);
                    console.error(response);
                }.bind(this)).always(function () {
                    this.setState({ sending: false });
                    this.loadingOff();
                }.bind(this));
            }
        }.bind(this));
    }

    handleUnpublish() {
        const msg = 'Are you sure you want to unpublish this porduct from ' + this.state.store + ' sale channel?';

        this.confirm(msg, function (confirmed) {
            if ( confirmed ) {
                const
                    { store } = this.state,
                    { product } = this.props,
                    uri = this.urlTo('product/update'),
                    data = this.requestParams({ sch: store, id: product.product_id, task: 'unpublish' });

                this.setState({ sending: true });
                this.loadingOn();
                $.post(uri, data, 'json').done(function (response) {
                    this.setProduct(response.product);
                    this.flashNotice('Product unpublished successfully from ' + store);
                }.bind(this)).fail(function (response) {
                    const error = response.responseJSON ? response.responseJSON.error : '';
                    this.flashError('Failed to unpublish the product from ' + store + '. ' + error);
                }.bind(this)).always(function () {
                    this.setState({ sending: false });
                    this.loadingOff();
                }.bind(this));
            }
        }.bind(this));
    }

    handleSubmit() {
        if ( this.isNotValid() ) return this.flashError('Please first complete all the required fields...!');

        const
            { store, storeDetails } = this.state,
            uri = this.urlTo('product/update'),
            data = this.requestParams({
                sch: store,
                task: 'update',
                id: storeDetails.product_id,
                product: JSON.stringify(storeDetails)
            });

        this.setState({ sending: true });
        this.loadingOn();

        $.post(uri, data).done(function (response) {
            this.setStoreDetails(response);
            this.flashNotice('The product synchronization process with ' + store + ' has been started');
            scrollTo(0, 0)
        }.bind(this)).fail(function (response) {
            const error = response.responseJSON ? response.responseJSON.error : '';
            this.flashError('Failed to update the product in ' + store + ' sales channel. ' + error);
        }.bind(this)).always(function () {
            this.setState({ sending: false });
            this.loadingOff();
        }.bind(this));
    }

    renderCategory() {
        const { storeDetails, store, canUpdateCategory, categoryAttribute } = this.state;

        return (
            <CategorySelectBox id={store + '-' + storeDetails.product_id + '-category'} store={store}
                               value={storeDetails[categoryAttribute]} disabled={!canUpdateCategory}
                               onChange={this.handleCategoryChange}
            />
        );
    }

    renderStatusDetails(connected) {
        const { store, storeDetails, alreadyLoad } = this.state;

        if ( connected ) {
            if ( storeDetails || !alreadyLoad ) {
                return this.success('The synchronization of this product with the ' + store + ' sales channel is enabled.')
            } else {
                return (
                    <div>
                        {
                            this.info(
                                'This product is in the process of being mapped for synchronization with ' +
                                'the ' + store + ' sales channel.',
                            )
                        }
                        {
                            this.info(
                                'It will be verified every 10 seconds until the process is completed and the form with the details of the product is displayed.'
                            )
                        }
                    </div>
                )
            }
        } else {
            return this.warn('The synchronization of this product with the ' + store + ' sales channel is disabled.');
        }
    }

    handleBrand(value) {
        // Abstract method.
    }

    renderStoreDetails() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <Card.Section subdued title="Category">
                    {this.renderCategory()}
                </Card.Section>
                <Card.Section subdued title="Properties">
                    <FormLayout>{this.renderProductProperties()}</FormLayout>
                </Card.Section>
                <Card.Section subdued title="Variants">
                    {this.renderVariants()}
                </Card.Section>
                <Card.Section subdued>
                    <Stack distribution="trailing" wrap="false">
                        <Button submit disabled={this.state.sending}>Submit</Button></Stack>
                </Card.Section>
            </Form>
        );
    }

    renderVariants(includeDefault) {
        const
            product = this.props.product,
            variants = this.variants(product, includeDefault),
            defaultVariant = this.defaultVariant(product);


        if ( variants.length > 0 ) {
            return (
                <ResourceList
                    resourceName={{ singular: 'variant', plural: 'variants' }}
                    items={variants}
                    renderItem={(variant) => {
                        var media,
                            images = this.images(variant),
                            title = variant == defaultVariant ? null : variant.title;

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
                                        {this.renderOptionValues ? this.renderOptionValues(variant) : null}
                                    </FormLayout>
                                </Card>
                            </ResourceList.Item>
                        );
                    }}
                />
            );
        } else {
            return this.info('This product does not have images.');
        }
    }

    render() {
        const
            { store, storeDetails, sending, notifications } = this.state,
            { product } = this.props,

            isInactive = this.isInactive(),
            connected = !isInactive && (product.sales_channels || []).find(function (sc) {
                return sc.channel == store;
            });

        var storeDetailsContent = null;

        if ( connected ) {
            if ( storeDetails === undefined ) {
                storeDetailsContent = this.renderLoading();
                this.loadStoreDetails(store, product);
            } else if ( storeDetails === null ) {
                storeDetailsContent = this.renderLoading();
                setTimeout(this.loadStoreDetails, 10000, store, product);
            } else {
                storeDetailsContent = <Card sectioned title="Details">{this.renderStoreDetails()}</Card>;
            }
        }

        return (
            <div>
                <AccountConnection
                    title={product.title}
                    connected={connected}
                    details={this.renderStatusDetails(connected)}
                    accountName={store}
                    action={{
                        content: connected ? 'Disable' : 'Enable',
                        onAction: this[connected ? 'handleUnpublish' : 'handlePublish'],
                        disabled: isInactive || sending
                    }}
                />
                {this.renderNotifications(notifications)}
                {storeDetailsContent}
            </div>
        );
    }
}
import React from 'react';
import {TextField, Button, Badge} from '@shopify/polaris';
import {SectionMajorTwotone as bulkOffIcon, ReplaceMajorMonotone as bulkOnIcon} from '@shopify/polaris-icons';
import {OMNAComponent} from './OMNAComponent';
import {NomenclatureSelectBox} from "./NomenclatureSelectBox";
import {PropertyBooleanSelectBox} from "./PropertyBooleanSelectBox";
import {PropertySelectBox} from "./PropertySelectBox";
import {PropertyContext} from './PropertyContext';
import {RichText} from "./RichText";

export class PropertyField extends OMNAComponent {
    handleChangeValue = (newValue) => {
        let valueAttr = this.valueAttr,
            currentValue = this.state.property[valueAttr],
            areEquals = false;

        currentValue = $.isArray(currentValue) ? currentValue.join(',') : currentValue;

        areEquals = areEquals || newValue === currentValue;
        areEquals = areEquals || $.isArray(newValue) && newValue.join(',') === currentValue;
        areEquals = areEquals || String(newValue) === currentValue;
        areEquals = areEquals || newValue === undefined && currentValue === '';
        areEquals = areEquals || newValue === '' && currentValue === undefined;
        areEquals = areEquals || $.isArray(newValue) && newValue.length === 0 && currentValue === undefined;

        if ( !areEquals ) {
            this.setState((prevState) => {
                prevState.property[valueAttr] = newValue;
                prevState.error = this.isNotValid;
                return prevState;
            });

            this.props.onChange && this.props.onChange(newValue, valueAttr, this.props.definition, this.state.property);
        }
    }

    handleBulkState = (e) => {
        e.stopPropagation();

        this.bulkState = !this.bulkState
    }

    getSelectOptions() {
        return this.props.definition.options.map((o) => {
            if ( typeof o === 'object' ) return {
                label: o.label || o.text || o.name || o.value,
                value: o.value || o.id || o.name
            };

            return { label: o, value: o }
        });
    }

    get isNotValid() {
        let { type, required } = this.props.definition,
            { property } = this.state,

            value = property[this.valueAttr];

        if ( type === 'rich_text' ) value = $('<div>' + value + '</div>').text();

        if ( required && (value === undefined || value === null || String(value).match(/^\s*$/)) ) {
            return 'This field is required';
        }
    }

    get valueAttr() {
        return this.props.definition.valueAttr || 'value'
    }

    get bulkState() {
        let { bulkState } = this.props;

        if ( typeof bulkState === 'function' ) {
            bulkState = this.state.bulkState = bulkState(this.props.definition.name)
        }

        return bulkState;
    }

    set bulkState(value) {
        let bulkState = this.props.bulkState;

        this.setState({ bulkState: value });

        if ( typeof bulkState === 'function' ) bulkState(this.props.definition.name, value);
    }

    renderLabel() {
        let { label, required, name } = this.props.definition,
            bulkState = this.bulkState;

        label = (label || name) + (required ? ' *' : '');

        if ( bulkState !== undefined ) {
            let tip, icon, status, text;

            if ( bulkState ) {
                tip = 'After changing the property, apply its value to all products in the list with the active bulk edition for this property.';
                icon = bulkOnIcon;
                status = 'attention';
                text = 'Bulk'
            } else {
                tip = 'The change in property value applies only to this product.';
                icon = bulkOffIcon;
                status = 'info';
                text = 'Single'
            }

            label = (
                <div className="bulk" title={tip}>
                    <Button icon={icon} plain onClick={this.handleBulkState}>
                        <span>{label}</span>
                        <span className="speech"><Badge status={status}>{text}</Badge></span>
                    </Button>
                </div>
            );
        }

        return label
    }

    renderProperty(property) {
        this.state.property = property;

        let { id, store, definition, disabled } = this.props,
            { type, required, name, min, max, rows, tags, idAttr } = definition,

            value = property[this.valueAttr],
            error = this.isNotValid,
            label = this.renderLabel();

        if ( type === 'brand' || name === 'brand' ) {
            return <NomenclatureSelectBox id={id} entity="Brand" className="brand-select-box" label={label}
                                          value={value} tags={tags} error={error}
                                          idAttr={idAttr || 'brand_id'} store={store} disabled={disabled}
                                          onChange={this.handleChangeValue}/>;
        }

        switch ( type ) {
            case 'rich_text':
                return (
                    <RichText label={label} value={value} id={id} error={error} disabled={disabled} rows={rows}
                              onChange={this.handleChangeValue}/>
                );

            case 'text':
                return (
                    <TextField type="text" label={label} value={value} id={id} error={error} minLength={min}
                               maxLength={max} disabled={disabled} multiline={rows ? rows : false}
                               onChange={this.handleChangeValue}
                    />
                );

            case 'numeric':
                return (
                    <TextField type="number" label={label} value={value} id={id} error={error} min={min} max={max}
                               disabled={disabled}
                               onChange={this.handleChangeValue}
                    />
                );

            case 'bool_select':
                return (
                    <PropertyBooleanSelectBox label={label} value={value} id={id} required={required} error={error}
                                              disabled={disabled}
                                              onChange={this.handleChangeValue}
                    />
                );

            case 'single_select':
                return (
                    <PropertySelectBox label={label} value={value} id={id} required={required} error={error}
                                       tags={tags} options={this.getSelectOptions()} disabled={disabled}
                                       onChange={this.handleChangeValue}
                    />
                );

            case 'multi_enum_input':
                return (
                    <PropertySelectBox label={label} value={value} id={id} required={required} error={error}
                                       tags={true} options={this.getSelectOptions()} disabled={disabled}
                                       onChange={this.handleChangeValue}
                    />
                );

            case 'multi_select':
                return (
                    <PropertySelectBox label={label} value={value} id={id} multiple={true} required={required}
                                       tags={tags} options={this.getSelectOptions()} disabled={disabled}
                                       onChange={this.handleChangeValue}
                    />
                );

            case 'nomenclature_select_box':
                const { entity, className } = this.props.definition;
                return <NomenclatureSelectBox id={id} entity={entity} className={className} label={label}
                                              value={value} tags={tags} error={error} idAttr={idAttr} store={store}
                                              disabled={disabled}
                                              onChange={this.handleChangeValue}/>;


            default:
                return <TextField type={type} label={label} value={value} id={id} error={error} min={min} max={max}
                                  disabled={disabled}
                                  onChange={this.handleChangeValue}/>;
        }
    }

    render() {
        return <PropertyContext.Consumer>{(property) => this.renderProperty(property)}</PropertyContext.Consumer>
    }
}
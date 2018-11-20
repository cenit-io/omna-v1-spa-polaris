import React from 'react';
import {TextField} from '@shopify/polaris';
import {OMNAComponent} from './OMNAComponent';
import {NomenclatureSelectBox} from "./NomenclatureSelectBox";
import {PropertyBooleanSelectBox} from "./PropertyBooleanSelectBox";
import {PropertySelectBox} from "./PropertySelectBox";
import {PropertyContext} from './PropertyContext';
import {RichText} from "./RichText";

export class PropertyField extends OMNAComponent {
    constructor(props) {
        super(props);

        this.getSelectOptions = this.getSelectOptions.bind(this);
        this.handleChangeValue = this.handleChangeValue.bind(this);
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
        const
            { type, required, valueAttr } = this.props.definition,
            { property } = this.state;

        let value = value = property[valueAttr || 'value'];

        if ( type === 'rich_text' ) value = $(value).text();

        if ( required && (value === undefined || value === null || String(value).match(/^\s*$/)) ) {
            return 'This field is required';
        }
    }

    handleChangeValue(value) {
        const { valueAttr } = this.props.definition;

        this.setState((prevState) => {
            prevState.property[valueAttr || 'value'] = value;
            prevState.error = this.isNotValid;
            return prevState;
        });

        this.props.onChange && this.props.onChange(value, valueAttr, this.state.property);
    }

    renderProperty(property) {
        this.state.property = property;

        const
            { id, store, definition, disabled } = this.props,
            { type, label, required, name, valueAttr, min, max, rows, tags, idAttr } = definition,

            value = property[valueAttr || 'value'],
            error = this.isNotValid,
            rLabel = (label || name) + (required ? ' *' : '');

        if ( type === 'brand' || name === 'brand' ) {
            return <NomenclatureSelectBox id={id} entity="Brand" className="brand-select-box" label={rLabel}
                                          value={value} tags={tags} error={error}
                                          idAttr={idAttr} store={store} disabled={disabled}
                                          onChange={this.handleChangeValue}/>;
        }

        switch ( type ) {
            case 'rich_text':
                return (
                    <RichText label={rLabel} value={value} id={id} error={error} disabled={disabled} rows={rows}
                              onChange={this.handleChangeValue}/>
                );

            case 'text':
                return (
                    <TextField type="text" label={rLabel} value={value} id={id} error={error} minLength={min}
                               maxLength={max} disabled={disabled}
                               onChange={this.handleChangeValue}
                    />
                );

            case 'numeric':
                return (
                    <TextField type="number" label={rLabel} value={value} id={id} error={error} min={min} max={max}
                               disabled={disabled}
                               onChange={this.handleChangeValue}
                    />
                );

            case 'bool_select':
                return (
                    <PropertyBooleanSelectBox label={rLabel} value={value} id={id} required={required} error={error}
                                              disabled={disabled}
                                              onChange={this.handleChangeValue}
                    />
                );

            case 'single_select':
                return (
                    <PropertySelectBox label={rLabel} value={value} id={id} required={required} error={error}
                                       tags={tags} options={this.getSelectOptions()} disabled={disabled}
                                       onChange={this.handleChangeValue}
                    />
                );

            case 'multi_enum_input':
                return (
                    <PropertySelectBox label={rLabel} value={value} id={id} required={required} error={error}
                                       tags={true} options={this.getSelectOptions()} disabled={disabled}
                                       onChange={this.handleChangeValue}
                    />
                );

            case 'multi_select':
                return (
                    <PropertySelectBox label={rLabel} value={value} id={id} multiple={true} required={required}
                                       tags={tags} options={this.getSelectOptions()} disabled={disabled}
                                       onChange={this.handleChangeValue}
                    />
                );

            case 'nomenclature_select_box':
                const { entity, className } = this.props.definition;
                return <NomenclatureSelectBox id={id} entity={entity} className={className} label={rLabel}
                                              value={value} tags={tags} error={error} idAttr={idAttr} store={store}
                                              disabled={disabled}
                                              onChange={this.handleChangeValue}/>;


            default:
                return <TextField type={type} label={rLabel} value={value} id={id} error={error} min={min} max={max}
                                  disabled={disabled}
                                  onChange={this.handleChangeValue}/>;
        }
    }

    render() {
        return <PropertyContext.Consumer>{(property) => this.renderProperty(property)}</PropertyContext.Consumer>
    }
}

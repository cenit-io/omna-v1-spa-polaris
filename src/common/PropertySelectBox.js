import React from 'react';
import {Labelled} from '@shopify/polaris';
import {OMNAComponent} from "./OMNAComponent";

export class PropertySelectBox extends OMNAComponent {
    onChange = (e) => this.props.onChange($(e.target).val());

    get parseOptions() {
        return this.props.options.map((o) => {
            if ( typeof o === 'object' ) return {
                label: o.label || o.text || o.name || o.value,
                value: o.value || o.id || o.name
            };

            return { label: o, value: o }
        });
    }

    get selectOptions() {
        const { value, multiple } = this.props;

        return multiple && !$.isArray(value) ? (value || '').split(',') : value
    }

    get isMultiple() {
        return this.props.multiple
    }

    renderWithAppContext(appContext) {
        const { id, label, tags, disabled } = this.props;

        return (
            <div className="property-select-box">
                <Labelled id={id}>{label}</Labelled>
                <select id={id} style={{ width: '100%' }} multiple={this.isMultiple} data-tags={tags}
                        defaultValue={this.selectOptions} disabled={disabled}>
                    {this.parseOptions.map((o, idx) => <option value={o.value} key={idx}>{o.label}</option>)}
                </select>
            </div>
        )
    }

    componentDidMount() {
        const selector = '#' + this.props.id;

        $(selector).select2();
        $(selector).on('change', this.onChange);
        $(selector).change();
    }

    componentDidUpdate(prevProps) {
        if ( JSON.stringify(this.props.value) !== JSON.stringify(prevProps.value) ) {
            $('#' + this.props.id).val(this.props.value).trigger('change')
        }
    }
}

import React from 'react';
import {Labelled} from '@shopify/polaris';
import {OMNAComponent} from './OMNAComponent';

export class LocationSelectBox extends OMNAComponent {
    onChange(e) {
        this.props.onChange($(e.target).val());
    }

    renderWithAppContext(appContext) {
        const
            { id, value, required } = this.props,
            selectedOption = value ? <option value={value}></option> : null;

        return (
            <div className="location-select-box">
                <Labelled id={id}>Stock location{required ? ' *' : ''}</Labelled>
                <select id={id} defaultValue={value} style={{ width: '100%' }}>{selectedOption}</select>
            </div>
        )
    }

    componentDidMount() {
        const
            uri = this.urlTo('locations'),
            selector = '#' + this.props.id;

        $(selector).select2({
            initSelection: (element, callback) => {
                if ( element.val() ) {
                    const params = this.requestParams({ sch: this.props.store, id: element.val() });

                    return $.getJSON(uri, params, (data) => {
                        return data.item ? callback({ id: data.item.id, text: data.item.name }) : null;
                    });
                }
            },

            ajax: {
                url: uri,
                dataType: 'json',
                data: (params) => {
                    params.page = params.page || 1;

                    return this.requestParams({
                        sch: this.props.store,
                        q: { p: params.page, s: params.term }
                    });
                },

                processResults: (data, params) => {
                    var items = data.items.map((item) => {
                        return { id: item.id, text: item.name }
                    });
                    params.page = params.page || 1;

                    return { results: items, pagination: { more: params.page < data.pages } };
                }
            }
        });

        $(selector).on('change', this.onChange.bind(this));
    }
}
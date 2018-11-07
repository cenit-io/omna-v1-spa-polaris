import React from 'react';
import {Labelled} from '@shopify/polaris';
import {OMNAComponent} from './OMNAComponent';

export class NomenclatureSelectBox extends OMNAComponent {
    constructor(props) {
        super(props);

        this.state = {
            idAttr: props.idAttr || 'name',
            textAttr: props.textAttr || 'name',
            entity: props.entity || 'Nomenclature',
            className: props.className || 'nomenclature-select-box'
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
            initSelection: (element, callback) => {
                var value = element.val();

                if ( value ) {
                    if ( this.props.tags ) return callback({ id: value, text: value });

                    if ( this.cacheItems ) {
                        var item = this.cacheItems.find((item) => item[idAttr] === value);
                        if ( item ) return callback(item);
                    }

                    const params = this.requestParams({
                        entity: entity, sch: store, id: value, idAttr: idAttr, textAttr: textAttr
                    });

                    return $.getJSON(uri, params, (data) => {
                        return data.item ? callback({ id: data.item[idAttr], text: data.item[textAttr] }) : null;
                    });
                }
            },

            ajax: {
                url: uri,
                dataType: 'json',
                data: (params) => {
                    params.page = params.page || 1;

                    return this.requestParams({
                        entity: entity, sch: store, idAttr: idAttr, textAttr: textAttr,
                        q: { p: params.page, s: params.term }
                    });
                },

                processResults: (data, params) => {
                    var items = data.items.map((item) => {
                        return { id: item[idAttr], text: item[textAttr] }
                    });
                    params.page = params.page || 1;
                    this.cacheItems = items;

                    return { results: items, pagination: { more: params.page < data.pages } };
                }
            }
        });

        $(selector).on('change', this.onChange.bind(this));
    }

    renderWithAppContext(appContext) {
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
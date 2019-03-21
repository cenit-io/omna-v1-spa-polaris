import React from 'react';
import {Labelled} from '@shopify/polaris';
import {PropertySelectBox} from "./PropertySelectBox";

export class NomenclatureSelectBox extends PropertySelectBox {
    constructor(props) {
        super(props);

        this.state = {
            idAttr: props.idAttr || 'name',
            textAttr: props.textAttr || 'name',
            entity: props.entity || 'Nomenclature',
            className: props.className || 'nomenclature-select-box'
        };
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

    getItem(value, callback) {
        let { entity, idAttr, textAttr } = this.state,

            item, params, uri = this.urlTo('nomenclatures');

        if ( value ) {
            if ( this.props.tags ) return callback({ id: value, text: value });

            if ( this.cacheItems && (item = this.cacheItems.find((i) => i[idAttr] === value)) ) return callback(item);

            params = this.requestParams({
                entity: entity, sch: this.props.store, id: value, idAttr: idAttr, textAttr: textAttr
            });

            return $.getJSON(uri, params, (data) => {
                return data.item ? callback({ id: data.item[idAttr], text: data.item[textAttr] }) : null;
            });
        }
    }

    componentDidMount() {
        let { entity, idAttr, textAttr } = this.state,

            uri = this.urlTo('nomenclatures'),
            $element = $('#' + this.props.id);

        $element.select2({
            initSelection: (element, callback) => this.getItem(element.val(), callback),

            ajax: {
                url: uri,
                dataType: 'json',
                data: (params) => {
                    params.page = params.page || 1;

                    return this.requestParams({
                        entity: entity, sch: this.props.store, idAttr: idAttr, textAttr: textAttr,
                        q: { p: params.page, s: params.term }
                    });
                },

                processResults: (data, params) => {
                    let items = data.items.map((item) => ({ id: item[idAttr], text: item[textAttr] }));
                    
                    params.page = params.page || 1;
                    this.cacheItems = items;

                    return { results: items, pagination: { more: params.page < data.pages } };
                }
            }
        });

        $element.on('change', this.onChange.bind(this));
    }

    componentDidUpdate(prevProps) {
        if ( JSON.stringify(this.props.value) !== JSON.stringify(prevProps.value) ) {
            this.getItem(this.props.value, (item) => {
                $('#' + this.props.id).append(new Option(item.text, item.id, true, true)).trigger('change')
            });
        }
    }
}
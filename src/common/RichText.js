import React from 'react';
import {Labelled, Card} from '@shopify/polaris';
import {OMNAComponent} from './OMNAComponent';

export class RichText extends OMNAComponent {
    render() {
        const { id, label, value, error, disabled, rows } = this.props;

        let className = ['rich-text-box'];

        disabled ? className.push('disabled') : error && className.push('error');

        return (
            <div id={'rich-text-box-' + id} className={className.join(' ')}>
                <Labelled id={id}>{label}</Labelled>
                <textarea id={id} style={{ width: '100%' }} defaultValue={value} disabled={disabled} rows={rows}/>
                <Labelled error={disabled ? '' : error}/>
            </div>
        )
    }

    componentDidMount() {
        const { id, disabled, onChange } = this.props;

        tinymce.init({
            selector: '#' + id,
            readonly: disabled,
            setup: (editor) => editor.on('change', () => onChange(editor.save()))
        });
    }

    componentWillUnmount() {
        tinymce.remove('#' + this.props.id);
    }

    componentDidUpdate(prevProps) {
        let { id, value, disabled } = this.props,
            editor = tinymce.get(id);

        if ( editor ) {
            editor.getBody().setAttribute('contenteditable', !disabled);
            if ( value != editor.getContent() ) editor.setContent(value);
        }
    }
}
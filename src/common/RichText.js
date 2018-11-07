import React from 'react';
import {Labelled} from '@shopify/polaris';
import {OMNAComponent} from './OMNAComponent';

export class RichText extends OMNAComponent {
    render() {
        const { id, label, value, error, disabled } = this.props;

        let className = ['rich-text-box'];

        if ( error ) className.push('error');
        if ( disabled ) className.push('disabled');

        return (
            <div className={className.join(' ')}>
                <Labelled id={id}>{label}</Labelled>
                <textarea id={id} style={{ width: '100%' }} defaultValue={value} disabled={disabled}/>
                <Labelled error={error}/>
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
}
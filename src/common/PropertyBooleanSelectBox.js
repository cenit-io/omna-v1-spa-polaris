import React from 'react';
import {PropertySelectBox} from "./PropertySelectBox";

export class PropertyBooleanSelectBox extends PropertySelectBox {
    onChange(e) {
        this.props.onChange($(e.target).val() === 'true');
    }

    get parseOptions() {
        const { trueLabel, falseLabel } = this.props;
        return [
            {
                label: falseLabel || 'No',
                value: 'false'
            },
            {
                label: trueLabel || 'Yes',
                value: 'true'
            },
        ]
    }

    get selectOptions() {
        const { value } = this.props;

        return value ? value.toString() : 'false'
    }

    get isMultiple(){
        return false
    }
}

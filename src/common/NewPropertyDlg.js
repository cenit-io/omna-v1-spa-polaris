import React from 'react';
import {Stack, Button, TextField, Card, Collapsible, FormLayout} from '@shopify/polaris';
import {OMNAComponent} from "./OMNAComponent";

export class NewPropertyDlg extends OMNAComponent {
    constructor(props) {
        super(props);
        this.state.active = false;
        this.state.property = { name: '', value: '' };

        this.handleOpen = this.handleOpen.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleOpen() {
        this.setState({ active: true, property: { name: '', value: '' } });
    }

    handleClose() {
        this.setState({ active: false });
    }

    handleAdd() {
        const { onAdd } = this.props;
        onAdd && onAdd(this.state.property) && this.handleClose();
    }

    handleChange(attr) {
        return (value) => this.setState((prevState) => {
            prevState.property[attr] = value;
            return prevState;
        });
    }

    get isValid() {
        const { property } = this.state;

        property.name = property.name.trim();
        property.value = property.value.trim();

        return property.name != '' && property.value != '';
    }

    render() {
        const { active, property } = this.state;

        return (
            <div className="new-property-dlg">
                {!active && (
                    <Stack distribution="trailing" wrap="false">
                        <Button icon="add" onClick={this.handleOpen}>Add new property</Button>
                    </Stack>
                )}
                <Collapsible open={active} id="qoo10-new-property-collapsible">
                    <Card title="New property:" sectioned={true}
                          primaryFooterAction={{
                              content: 'Add',
                              icon: 'add',
                              onAction: this.handleAdd,
                              disabled: !this.isValid
                          }}
                          secondaryFooterAction={{
                              content: 'Cancel',
                              icon: 'cancelSmall',
                              onAction: this.handleClose,
                              destructive: true
                          }}>
                        <FormLayout>
                            <TextField type="text" value={property.name}
                                       label="Name" onChange={this.handleChange('name')}
                                       placeholder="New property name"/>
                            <TextField type="text" value={property.value}
                                       label="Value" onChange={this.handleChange('value')}
                                       placeholder="New property value"/>
                        </FormLayout>
                    </Card>
                </Collapsible>
            </div>
        )
    }
}
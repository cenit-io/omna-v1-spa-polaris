import React from 'react';
import {Popover, FormLayout, Checkbox, Card} from '@shopify/polaris';
import {OMNAComponent} from "../../common/OMNAComponent";

export class ProductStoreEnableAction extends OMNAComponent {
    constructor(props) {
        super(props);
        this.state.channels = {}
    }

    handleChange(name) {
        return () => this.setState((prevState) => {
            const channels = prevState.channels;

            channels[name] = channels[name] === true ? 'indeterminate' : !channels[name];

            return prevState
        })
    }

    channelState(name) {
        const { channels } = this.state;

        if ( channels[name] === undefined ) channels[name] = 'indeterminate';

        return channels[name]
    }

    helpText(name) {
        const { channels } = this.state;

        switch ( channels[name] ) {
            case 'indeterminate':
                return this.warn('Keep the status of this sales channel.');
            case true:
                return this.success('Activate this sales channel.');
            case false:
                return this.error('Deactivate this sales channel.');
        }
    }

    renderChannels(appContext) {
        const { channels } = appContext.settings;

        let eChannels = [], group = [];

        eChannels.push(group);
        for ( let j = 1; j < 10; j++ )
            Object.keys(channels).forEach((i) => {
                if ( channels[i].connected ) {
                    group.push(channels[i].name);
                    if ( group.length === 3 ) {
                        group = [];
                        eChannels.push(group);
                    }
                }
            });

        return eChannels.map((group, idx) => {
            return (
                <FormLayout.Group key={idx}>
                    {
                        group.map((name, idx) => {
                            return <Checkbox label={name} key={idx} checked={this.channelState(name)}
                                             helpText={this.helpText(name)}
                                             onChange={this.handleChange(name)}/>
                        })
                    }
                </FormLayout.Group>
            )

        })
    }

    renderWithAppContext(appContext) {
        const active = this.props.active();

        return (
            <div className={'channels-activator modal ' + (active ? 'open' : 'close')}>
                <Card sectioned title="Sales channels [ Enable / Keep / Disable ] status:"
                      primaryFooterAction={{
                          content: 'Enable',
                          icon: 'checkmark',
                          // onAction: this.handleAdd,
                          // disabled: !this.isValid
                      }}
                      secondaryFooterAction={{
                          content: 'Cancel',
                          icon: 'cancelSmall',
                          onAction: this.props.onClose,
                          destructive: true
                      }}>
                    <FormLayout>{this.renderChannels(appContext)}</FormLayout>
                </Card>
            </div>
        )
    }
}
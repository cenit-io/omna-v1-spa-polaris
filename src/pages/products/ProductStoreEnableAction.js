import React from 'react';
import {Popover, FormLayout, Checkbox, Card} from '@shopify/polaris';
import {OMNAComponent} from "../../common/OMNAComponent";

export class ProductStoreEnableAction extends OMNAComponent {
    constructor(props) {
        super(props);
        this.state.channels = {};
    }

    handleChange(name) {
        return () => this.setState((prevState) => {
            const channels = prevState.channels;

            channels[name] = channels[name] === true ? 'indeterminate' : !channels[name];

            return prevState
        })
    }

    get heightClass() {
        return ' rows' + Math.max(1, Math.min(3, Math.ceil(this.channelNames.length / 3)))
    }

    get isValid() {
        const { channels } = this.state;
        return Object.keys(channels).find((name) => channels[name] !== 'indeterminate') != undefined
    }

    channelState(name) {
        const { channels } = this.state;

        if ( channels[name] === undefined ) channels[name] = 'indeterminate';

        return channels[name]
    }

    channelCheckbox(name) {
        let method, help, state = this.channelState(name);

        switch ( this.state.channels[name] ) {
            case 'indeterminate':
                method = 'warn';
                help = 'Keep the status of';
                break;
            case true:
                method = 'success';
                help = 'Activate';
                break;
            case false:
                method = 'error';
                help = 'Deactivate'
        }

        return this[method](<Checkbox checked={state} label={this.channelName(name)}
                                      helpText={help + ' this sales channel.'}
                                      onChange={this.handleChange(name)}/>);
    }

    renderChannels(appContext) {
        const eChannels = this.channelNames.chunk(3);

        return eChannels.map((group, idx) => {
            return (
                <FormLayout.Group key={idx}>
                    {
                        group.map((name, idx) => {
                            return <div key={idx}>{this.channelCheckbox(name)}</div>
                        })
                    }
                </FormLayout.Group>
            )

        })
    }

    renderWithAppContext(appContext) {
        const active = this.props.active();

        return (
            <div className={'channels-activator modal ' + (active ? 'open' : 'close') + this.heightClass}>
                <Card sectioned title="Sales channels [ Enable / Keep / Disable ] status:"
                      primaryFooterAction={{
                          content: 'Enable',
                          icon: 'checkmark',
                          onAction: () => this.props.onClose(this.state.channels),
                          disabled: !this.isValid
                      }}
                      secondaryFooterAction={{
                          content: 'Cancel',
                          icon: 'cancelSmall',
                          onAction: () => this.props.onClose(),
                          destructive: true
                      }}>
                    <FormLayout>{this.renderChannels(appContext)}</FormLayout>
                </Card>
            </div>
        )
    }
}
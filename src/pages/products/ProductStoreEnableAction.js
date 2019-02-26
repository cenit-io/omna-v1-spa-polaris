import React from 'react';
import {Popover, FormLayout, Checkbox, Card} from '@shopify/polaris';
import {OMNAComponent} from "../../common/OMNAComponent";

export class ProductStoreEnableAction extends OMNAComponent {
    constructor(props) {
        super(props);
        this.state.channels = {};

        this.handleOnSend = this.handleOnSend.bind(this)
        this.handleOnCancel = this.handleOnCancel.bind(this)
    }

    handleChange(name) {
        return () => this.setState((prevState) => {
            let deprecated = this.channels[name].deprecated,
                status = prevState.channels[name];

            prevState.channels[name] = !status ? 'indeterminate' : (status === 'indeterminate') && !deprecated;

            return prevState
        })
    }

    handleOnSend() {
        this.props.onClose(this.state.channels)
    }

    handleOnCancel() {
        this.props.onClose()
    }

    get heightClass() {
        return ' rows' + Math.max(1, Math.min(3, Math.ceil(this.activeChannels.length / 3)))
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

    renderChannels() {
        const aChannels = this.activeChannels.chunk(3);

        return aChannels.map((group, idx) => {
            return (
                <FormLayout.Group key={idx}>
                    {
                        group.map((channel, idx) => {
                            return <div key={idx}>{this.channelCheckbox(channel.name)}</div>
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
                          content: 'Send',
                          icon: 'checkmark',
                          onAction: this.handleOnSend,
                          disabled: !this.isValid
                      }}
                      secondaryFooterAction={{
                          content: 'Cancel',
                          icon: 'cancelSmall',
                          onAction: this.handleOnCancel,
                          destructive: true
                      }}>
                    <FormLayout>{this.renderChannels(appContext)}</FormLayout>
                </Card>
            </div>
        )
    }
}
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

    get heightClass() {
        return ' rows' + Math.max(1, Math.min(3, Math.ceil(this.channelNames.length / 3)))
    }

    get channelNames() {
        const { channels } = this.state.appContext.settings;
        let eChannels = [];

        Object.keys(channels).forEach((i) => channels[i].connected && eChannels.push(channels[i].name));

        return eChannels
    }

    channelState(name) {
        const { channels } = this.state;

        if ( channels[name] === undefined ) channels[name] = 'indeterminate';

        return channels[name]
    }

    channelName(name) {
        const countries = { SG: 'Singapore', MY: 'Malaysia' };

        return name.replace(/^(Lazada|Shopee)(.+)$/, (name, channel, acronym) => {
            return channel + ' ' + countries[acronym] || acronym
        });
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
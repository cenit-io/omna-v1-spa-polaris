import React from 'react';
import {AccountConnection, DescriptionList, FooterHelp} from '@shopify/polaris';
import {OMNAComponent} from './Commons';

export class SetupOMNA extends OMNAComponent {
    constructor(props) {
        super(props);

        this.state.sending = false;

        this.handleActiveSaleChannels = this.handleActiveSaleChannels.bind(this);
    }

    handleActiveSaleChannels() {
        const settings = this.getValue('OMNA.settings');

        this.setState({ sending: true });

        if ( settings.plan.status == 'pending' ) {
            open(this.getValue('OMNA.settings.plan.confirmation_url'), '_parent');
        } else if ( settings.plan.status == 'active' ) {
            this.confirm('Are you sure you want to cancel the OMNA Plan?', (confirmed) => {
                if ( confirmed ) {
                    open(this.urlTo('plan/cancel?') + this.queryParams(), '_self')
                } else {
                    this.setState({ sending: false });
                }
            })
        } else {
            open(this.urlTo('plan/active?') + this.queryParams(), '_self')
        }
    }

    render() {
        const settings = this.getValue('OMNA.settings');

        var action, details,
            destructive = false,
            connected = false,
            icon = 'checkmark';

        if ( settings.plan.status == 'pending' ) {
            action = 'Confirm';
            details = this.warn('Is pending for confirmation')
        } else if ( settings.plan.status == 'active' ) {
            connected = true
            action = 'Cancel';
            details = this.success('Is activated');
            destructive = true;
            icon = 'cancelSmall';
        } else {
            action = 'Activate';
            details = this.warn('Is not active')
        }

        return (
            <div className={'account-' + (connected ? 'connected' : 'disconnected')}>
                <AccountConnection
                    connected={connected}
                    details={details}
                    accountName='OMNA Plan'
                    action={{
                        content: action,
                        destructive: destructive,
                        disabled: this.state.sending,
                        icon: icon,
                        onAction: this.handleActiveSaleChannels
                    }}
                    termsOfService={
                        this.info('Details:',
                            <DescriptionList
                                items={[
                                    { term: 'Shop domain:', description: settings.shop_domain },
                                    { term: 'Tenant name:', description: settings.tenant_name },
                                    { term: 'Plan price:', description: settings.plan.price },
                                    { term: 'Balance used:', description: settings.plan.balance_used },
                                    { term: 'Balance remaining:', description: settings.plan.balance_remaining },
                                    { term: 'Trial days:', description: settings.plan.trial_days },
                                ]}
                            />
                        )
                    }
                />
                <FooterHelp>
                    {'Learn more about '}
                    {this.renderHelpLink('OMNA plan', 'https://support.omna.io/hc/en-us/articles/360015188952')}
                    {' status.'}
                </FooterHelp>
            </div>
        )
    }
}

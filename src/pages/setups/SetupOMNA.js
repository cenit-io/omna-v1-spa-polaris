import React from 'react';
import {AccountConnection, DescriptionList, FooterHelp, Card, Banner} from '@shopify/polaris';
import {SetupStore} from "./SetupStore";

export class SetupOMNA extends SetupStore {
    constructor(props) {
        super(props);

        this.state.sending = false;

        this.handleChangePlan = this.handleChangePlan.bind(this);
    }

    handleChangePlan(_, plan) {
        const { appContext } = this.state;
        plan = plan || appContext.settings.plan;

        this.setState({ sending: true });

        if ( plan.status === 'pending' ) {
            open(plan.confirmation_url, '_parent');
        } else if ( plan.status === 'active' ) {
            this.confirm('Are you sure you want to cancel the (' + plan.name + ') plan?', (confirmed) => {
                if ( confirmed ) {
                    open(this.urlTo('plan/cancel?') + this.queryParams(), '_self')
                } else {
                    this.setState({ sending: false });
                }
            })
        } else {
            open(this.urlTo('plan/active?') + this.queryParams({ plan: plan.name }), '_self')
        }
    }

    get currentPlanItems() {
        const
            appContext = this.state.appContext,
            plan = appContext.settings.plan || {},
            metadata = plan.metadata || {};

        if ( plan.status === 'active' || plan.status === 'pending' ) {
            return [
                { term: 'Shop domain:', description: appContext.settings.shop_domain },
                { term: 'Tenant name:', description: appContext.settings.tenant_name },

                { term: 'Plan name:', description: plan.name },
                { term: <span>&nbsp;&#x21FE; Price:</span>, description: plan.price },
                { term: <span>&nbsp;&#x21FE; Cost by order:</span>, description: metadata.cost_by_order },
                { term: <span>&nbsp;&#x21FE; Order limit:</span>, description: metadata.order_limit },
                { term: <span>&nbsp;&#x21FE; Capped amount:</span>, description: plan.capped_amount },
                { term: <span>&nbsp;&#x21FE; Terms:</span>, description: metadata.terms },
                { term: <span>&nbsp;&#x21FE; Trial days:</span>, description: plan.trial_days },

                { term: 'Balance used:', description: plan.balance_used },
                { term: 'Balance remaining:', description: plan.balance_remaining },
            ]
        } else {
            return [
                { term: 'Shop domain:', description: appContext.settings.shop_domain },
                { term: 'Tenant name:', description: appContext.settings.tenant_name },
                { term: 'Plan name:', description: 'Not yet subscribed to any plan' },
            ]
        }
    }

    renderPlans(appContext) {
        return appContext.settings.plans_data.map((plan, idx) => {
                return (
                    <Card sectioned key={idx} primaryFooterAction={{
                        content: 'Take the ' + plan.name + ' plan',
                        onAction: (e) => this.handleChangePlan(e, plan),
                    }}>
                        <Banner title={plan.name} status={idx % 2 == 0 ? 'success' : 'info'} icon="chevronRight">
                            <DescriptionList
                                items={[
                                    { term: 'Price:', description: plan.price },
                                    { term: 'Cost by order:', description: plan.cost_by_order },
                                    // { term: 'Order limit:', description: plan.order_limit },
                                    { term: 'Capped amount:', description: plan.capped_amount },
                                    { term: 'Terms:', description: plan.terms },
                                    { term: 'Trial days:', description: plan.trial_days },
                                ]}/>
                        </Banner>
                    </Card>
                )
            }
        )
    }

    renderWithAppContext(appContext) {
        let action, details,
            destructive = false,
            connected = false,
            icon = 'checkmark',
            plan = appContext.settings.plan;

        if ( plan.status === 'pending' ) {
            action = 'Confirm';
            details = this.warn('The selected plan is pending confirmation')
        } else if ( plan.status === 'active' ) {
            connected = true;
            action = 'Cancel';
            details = this.success('Is activated');
            destructive = true;
            icon = 'cancelSmall';
        } else {
            action = false;
            details = this.warn('Not yet subscribed to any plan')
        }

        return (
            <div className={'setup sale-channel OMNA ' + (connected ? 'connected' : 'disconnected')}>
                <AccountConnection
                    connected={connected}
                    details={details}
                    accountName='Current plan'
                    action={action && {
                        content: action,
                        destructive: destructive,
                        disabled: this.state.sending,
                        icon: icon,
                        onAction: this.handleChangePlan
                    }}
                    termsOfService={this.info('Details:', <DescriptionList items={this.currentPlanItems}/>)}
                />
                <Card sectioned title="Available plans">{this.renderPlans(appContext)}</Card>
                <FooterHelp>
                    {'Learn more about '}
                    {this.renderExternalLink('how configure', this.state.helpUri)}
                    {' status.'}
                </FooterHelp>
            </div>
        )
    }
}

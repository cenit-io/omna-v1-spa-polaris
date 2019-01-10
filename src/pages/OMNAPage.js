import React from 'react';
import {Page, Card} from '@shopify/polaris';
import {OMNAComponent} from "../common/OMNAComponent";

export class OMNAPage extends OMNAComponent {
    constructor(props) {
        super(props);
        this.state.title = 'OMNA for Shopify';
        this.state.subTitle = 'Sell Anywhere, Manage On One';
        this.state.notifications = [];
        this.state.alreadyCheckInactive = false;
    }

    checkInactive() {
        const { alreadyCheckInactive, notifications, appContext } = this.state;

        if ( !alreadyCheckInactive && appContext.settings.status === 'ready' && this.isInactive ) {
            this.state.alreadyCheckInactive = true;

            let plan = appContext.settings.plan || {},
                nextAction = false,
                message;

            if ( plan.status === 'cancelled' || plan.status === 'declined' ) {
                nextAction = 'Activate'
            } else if ( plan.status === 'pending' ) {
                nextAction = 'Confirm'
            }

            nextAction && notifications.unshift({
                message: <div>{this.renderGoToSetup(<b>{nextAction}</b>)}{this.renderGoToUninstall()}</div>,
                status: 'info'
            });

            if ( plan.status ) {
                message = 'the status of (' + plan.name + ') plan is ' + plan.status + '.';
            } else {
                message = 'it is not yet subscribed to any plan.';
            }

            notifications.unshift({ message: 'The application is disabled because ' + message, status: 'warning' });
        }
    }

    renderInstalling() {
        if ( this.state.appContext.settings.status === 'installing' ) {
            this.loadingOn();

            setTimeout(() => window.location.reload(), 30000);

            return <Card>{this.warn('Please wait while the installation process is complete.')}</Card>;
        }
    }

    renderSecondaryActions() {
        if ( this.state.appContext.settings.status === 'ready' ) {
            return [
                {
                    content: 'Support',
                    href: 'https://omna.freshdesk.com/support/home',
                    target: 'new'
                },
                {
                    content: 'Home',
                    onAction: () => OMNA.render('home')
                },
                {
                    content: 'Products',
                    disabled: this.isInactive,
                    onAction: () => OMNA.render('products')
                },
                {
                    content: 'Setup',
                    onAction: () => OMNA.render('setup')
                }
            ]
        }
    }

    renderPageContent() {
        return '...';
    }

    renderWithAppContext(appContext) {
        const { title, subTitle, notifications } = this.state;
        const pageContent = this.renderPageContent();

        this.checkInactive();

        return (
            <Page title={title} separator={true} secondaryActions={this.renderSecondaryActions()}>
                {this.renderNotifications(notifications)}
                {this.renderInstalling()}

                <Card title={subTitle}>{pageContent}</Card>
            </Page>
        )
    }
}
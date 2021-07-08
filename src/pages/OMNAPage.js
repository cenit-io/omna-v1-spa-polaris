import React from 'react';
import { Page, Card } from '@shopify/polaris';
import { OMNAPageSection } from "./OMNAPageSection";
import { Utils } from "../common/Utils";

export class OMNAPage extends OMNAPageSection {
  constructor(props) {
    super(props);
    this.state.title = 'OMNA for Shopify';
    this.state.subTitle = 'Sell Anywhere, Manage On One';
    this.state.alreadyCheckInactive = false;
  }

  get actions() {
    return [];
  }

  checkInactive() {
    const { alreadyCheckInactive, notifications, appContext } = this.state;

    if (!alreadyCheckInactive && this.isAuthenticated && this.isInactive) {
      this.state.alreadyCheckInactive = true;

      let plan = appContext.settings.plan || {},
        nextAction = false,
        message;

      if (plan.status === 'cancelled' || plan.status === 'declined') {
        nextAction = 'Activate'
      } else if (plan.status === 'pending') {
        nextAction = 'Confirm'
      }

      nextAction && notifications.unshift({
        message: <div>{Utils.renderGoToSetup(<b>{nextAction}</b>)}{Utils.renderGoToUninstall()}</div>,
        status: 'info'
      });

      if (plan.status) {
        message = 'the status of (' + plan.name + ') plan is ' + plan.status + '.';
      } else {
        message = 'it is not yet subscribed to any plan.';
      }

      notifications.unshift({ message: 'The application is disabled because ' + message, status: 'warning' });
    }
  }

  renderInstalling() {
    if (this.isInstalling) {
      this.loadingOn();

      setTimeout(() => window.location.reload(), 30000);

      return <Card>{Utils.warn('Please wait while the installation process is complete.')}</Card>;
    }
  }

  renderSecondaryActions() {
    if (this.isAuthenticated) {
      return [
        {
          content: 'Support',
          href: 'https://omna.freshdesk.com/support/solutions',
          target: 'new'
        },
        {
          content: 'Home',
          onAction: () => Utils.renderPage('home')
        },
        {
          content: 'Products',
          disabled: this.isInactive,
          onAction: () => Utils.renderPage('products')
        },
        {
          content: 'Orders',
          disabled: this.isInactive,
          onAction: () => Utils.renderPage('orders')
        },
        {
          content: 'Setup',
          onAction: () => Utils.renderPage('setup')
        }
      ]
    }
  }

  renderPageContent() {
    return '...';
  }

  renderWithAppContext(appContext) {
    let { title, subTitle, sectioned, actions } = this.state,
      pageContent = this.renderPageContent();

    this.checkInactive();
    return (
      <Page title={title} separator={true} secondaryActions={this.renderSecondaryActions()}>
        {this.renderNotifications()}
        {this.renderInstalling()}

        <Card sectioned={sectioned} title={subTitle} actions={this.actions}>{pageContent}</Card>
      </Page>
    )
  }
}
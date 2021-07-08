import React from 'react';
import { OMNAPage } from "../OMNAPage";
import { AuthSection } from "./AuthSection";
import { AboutSection } from "./AboutSection";

export class HomePage extends OMNAPage {
  constructor(props) {
    super(props);
    this.state.sectioned = true;
    this.state.redirectToOMNAv2 = false;
  }

  handleGotoOMNAv2 = () => this.setState({ redirectToOMNAv2: true });

  get actions() {
    if (this.hasShopDomain && !this.isAuthorized) return [{ content: 'Goto OMNA', onAction: this.handleOpenOMNAv2 }];
    return [];
  }

  renderNotifications() {
    return super.renderNotifications('Authorization')
  }

  renderPageContent() {
    return (
      <div>
        <AuthSection onGotoOMNAv2={this.handleGotoOMNAv2} />
        <AboutSection />
      </div>
    );
  }
}
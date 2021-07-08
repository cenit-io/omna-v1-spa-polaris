import React from 'react';
import { OMNAPage } from "../OMNAPage";
import { AuthSection } from "./AuthSection";
import { AboutSection } from "./AboutSection";

export class HomePage extends OMNAPage {
  constructor(props) {
    super(props);
    this.state.sectioned = true;
  }

  handleChangeDomain = () => {
    if (this.hasShopDomain && !this.isAuthorized) {
      this.setState((prevState) => {
        prevState.actions.push({ content: 'Goto OMNA', onAction: this.handleOpenOMNAv2 })
        return prevState;
      });
    }
  }

  renderNotifications() {
    return super.renderNotifications('Authorization')
  }

  renderPageContent() {
    return (
      <div>
        <AuthSection onChangeDomain={this.handleChangeDomain} />
        <AboutSection />
      </div>
    );
  }
}
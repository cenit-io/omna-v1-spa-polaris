import React from 'react';
import { OMNAPage } from "../OMNAPage";
import { AuthSection } from "./AuthSection";
import { AboutSection } from "./AboutSection";

export class HomePage extends OMNAPage {
  constructor(props) {
    super(props);
    this.state.sectioned = true;
  }

  renderNotifications() {
    return super.renderNotifications('Authorization')
  }

  renderPageContent() {
    return (
      <div>
        <AuthSection />
        <AboutSection />
      </div>
    );
  }
}
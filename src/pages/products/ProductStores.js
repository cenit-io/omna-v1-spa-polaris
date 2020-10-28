import React from 'react';
import { Card, Tabs } from '@shopify/polaris';
import { OMNAComponent } from "../../common/OMNAComponent";
import { StoreContext } from "../../common/StoreContext";

export class ProductStores extends OMNAComponent {
  constructor(props) {
    super(props);
    this.state.selectedTabIndex = props.selectedTabIndex || 0;
  }

  handleTabChange = (selectedTabIndex) => {
    this.setState({ selectedTabIndex: selectedTabIndex });
  }

  get selectedTab() {
    return this.tabs[this.state.selectedTabIndex]
  }

  renderWithAppContext(appContext) {
    return (
      <Card sectioned>
        <Tabs tabs={this.tabs} selected={this.state.selectedTabIndex} onSelect={this.handleTabChange} />
        <StoreContext.Provider value={this.selectedTab.channel}>
          {this.renderProductStore()}
        </StoreContext.Provider>
      </Card>
    )
  }
}
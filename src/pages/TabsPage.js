import React from 'react';
import {Card, Tabs} from '@shopify/polaris';
import {OMNAPage} from "./OMNAPage";

export class TabsPage extends OMNAPage {
    constructor(props) {
        super(props);
        this.state.selectedTabIndex = props.selectedTabIndex || 0;
    }

    handleTabChange = (selectedTabIndex) => {
        this.setState({ selectedTabIndex: selectedTabIndex });
    }

    get sectionTitle() {
        return (this.selectedTab.title || this.selectedTab.content) + ':';
    }

    get selectedTab() {
        return this.tabs[this.state.selectedTabIndex]
    }

    renderPageContent() {
        const
            sIdx = this.state.selectedTabIndex,
            tabs = this.tabs;

        return (
            <Card sectioned>
                <Tabs tabs={tabs} selected={sIdx} onSelect={this.handleTabChange}/>
                <Card.Section title={this.sectionTitle}>
                    {tabs[sIdx].body}
                </Card.Section>
            </Card>
        );
    }
}
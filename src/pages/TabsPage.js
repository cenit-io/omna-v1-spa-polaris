import React from 'react';
import {Card, Tabs} from '@shopify/polaris';
import {OMNAPage} from "./OMNAPage";

export class TabsPage extends OMNAPage {
    constructor(props) {
        super(props);
        this.state.selectedTabIndex = props.selectedTabIndex || 0;
    }

    handleTabChange(selectedTabIndex) {
        this.setState({ selectedTabIndex: selectedTabIndex });
    }

    getSectionTitle(tab) {
        return null;
    }

    renderPageContent() {
        const
            sIdx = this.state.selectedTabIndex,
            tabs = this.tabs();

        return (
            <div>
                <Card sectioned>
                    <Tabs tabs={tabs} selected={sIdx} onSelect={this.handleTabChange.bind(this)}/>
                    <Card.Section title={this.getSectionTitle(tabs[sIdx])}>
                        {tabs[sIdx].body}
                    </Card.Section>
                </Card>
            </div>
        );
    }
}
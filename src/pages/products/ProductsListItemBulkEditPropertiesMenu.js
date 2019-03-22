import React from 'react';
import {Button, Popover, ActionList} from '@shopify/polaris';
import {SectionMajorTwotone as bulkOffIcon, ReplaceMajorMonotone as bulkOnIcon} from '@shopify/polaris-icons';
import {OMNAComponent} from "../../common/OMNAComponent";
import {Utils} from "../../common/Utils";

export class ProductsListItemBulkEditPropertiesMenu extends OMNAComponent {
    constructor(props) {
        super(props);

        this.state.active = false;

        this.handleTogglePopover = this.handleTogglePopover.bind(this)
    }

    handleTogglePopover() {
        this.setState(({ active }) => ({ active: !active }));
    }

    propertyBulkState(pName, nBulkState) {
        let aBulkStates = Utils.getSessionItem('bulk-properties-states') || {},
            cBulkState, pBulkState;

        pBulkState = aBulkStates[pName] = aBulkStates[pName] || {};

        cBulkState = aBulkStates[pName] === true || pBulkState.all === true;

        if ( nBulkState === undefined ) return cBulkState;

        if ( pName === 'all' ) {
            aBulkStates = { all: nBulkState }
        } else {
            aBulkStates[pName] = { all: nBulkState }
        }

        Utils.setSessionItem('bulk-properties-states', aBulkStates);

        this.props.onBlukStateChange(aBulkStates)
    }

    label(status) {
        return status ? 'Disable' : 'Enable'
    }

    icon(status) {
        return status ? bulkOffIcon : bulkOnIcon
    }

    renderActivator() {
        return <Button disclosure onClick={this.handleTogglePopover}> More actions</Button>
    }

    renderWithAppContext(appContext) {
        let sAll = this.propertyBulkState('all');

        return (
            <Popover active={this.state.active} activator={this.renderActivator()} onClose={this.handleTogglePopover}>
                <ActionList items={
                    [
                        {
                            content: this.label(sAll) + ' Bulk-Edition for all properties', icon: this.icon(sAll),
                            onAction: () => this.propertyBulkState('all', !sAll)
                        },
                    ]
                }/>
            </Popover>
        )
    }
}

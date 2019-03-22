import React from 'react';
import {Button, Popover, ActionList} from '@shopify/polaris';
import {
    SectionMajorTwotone as bulkOffIcon,
    ReplaceMajorMonotone as bulkOnIcon,
    CircleInformationMajorTwotone as BulkInvertIcon
} from '@shopify/polaris-icons';
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

        if ( aBulkStates[pName] === undefined ) aBulkStates[pName] = (pName === '@all') ? false : {};

        cBulkState = (pName === '@all') ? aBulkStates['@all'] === true : aBulkStates[pName]['@all'] === true;

        if ( nBulkState === undefined ) return cBulkState;

        if ( pName === '@all' ) {
            if ( nBulkState === 'invert' ) {
                aBulkStates['@all'] = !aBulkStates['@all'];
                Object.keys(aBulkStates).forEach(pName => {
                    if ( pName !== '@all' ) {
                        Object.keys(aBulkStates[pName]).forEach(pId => aBulkStates[pName][pId] = !aBulkStates[pName][pId])
                    }
                })
            } else {
                aBulkStates = { '@all': nBulkState }
            }
        } else {
            aBulkStates[pName] = { '@all': nBulkState }
        }

        Utils.setSessionItem('bulk-properties-states', aBulkStates);
        this.setState({ active: false });

        this.props.onBlukStateChange(aBulkStates)
    }

    label(status) {
        return status ? 'Disable' : 'Enable'
    }

    icon(status) {
        return status ? bulkOffIcon : bulkOnIcon
    }

    renderActivator() {
        return <Button disclosure onClick={this.handleTogglePopover}>Bulk-Edition</Button>
    }

    renderWithAppContext(appContext) {
        let sAll = this.propertyBulkState('@all');

        return (
            <Popover active={this.state.active} activator={this.renderActivator()} onClose={this.handleTogglePopover}>
                <ActionList items={
                    [
                        {
                            content: this.label(sAll) + ' for all properties', icon: this.icon(sAll),
                            onAction: () => this.propertyBulkState('@all', !sAll)
                        },
                        {
                            content: 'Invert for all properties', icon: BulkInvertIcon,
                            onAction: () => this.propertyBulkState('@all', 'invert')
                        },
                    ]
                }/>
            </Popover>
        )
    }
}

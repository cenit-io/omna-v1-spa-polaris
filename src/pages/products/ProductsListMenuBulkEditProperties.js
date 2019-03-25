import React from 'react';
import {Button, Popover, ActionList} from '@shopify/polaris';
import {
    SectionMajorTwotone as bulkOffIcon,
    ReplaceMajorMonotone as bulkOnIcon,
    CircleInformationMajorTwotone as BulkInvertIcon
} from '@shopify/polaris-icons';
import {OMNAComponent} from "../../common/OMNAComponent";
import {Utils} from "../../common/Utils";

export class ProductsListMenuBulkEditProperties extends OMNAComponent {
    constructor(props) {
        super(props);

        this.state.active = false;

        this.handleTogglePopover = this.handleTogglePopover.bind(this)
    }

    handleTogglePopover() {
        this.setState(({ active }) => ({ active: !active }));
    }

    get propertiesDefinition() {
        return Utils.loadPropertiesDefinition(this.props.channel, this.props.categoryId, this);
    }

    propertyBulkState(pName, nBulkState) {
        let aBulkStates = Utils.getSessionItem('bulk-properties-states') || {},
            cBulkState;

        if ( aBulkStates[pName] === undefined ) aBulkStates[pName] = (pName === '@all') ? false : {};

        cBulkState = (pName === '@all') ? aBulkStates['@all'] === true : aBulkStates[pName]['@all'] === true;

        if ( nBulkState === undefined ) return cBulkState;
        console.log(pName, cBulkState, nBulkState);

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

        this.props.onBlukEditPropertyStateChange(aBulkStates)
    }

    label(state) {
        return state ? 'ON' : 'OFF'
    }

    icon(state) {
        return state ? bulkOnIcon : bulkOffIcon
    }

    badge(state) {
        return { content: this.label(state), status: state ? 'attention' : 'info' }
    }

    renderActivator() {
        return <Button disclosure onClick={this.handleTogglePopover}>Bulk-Edition</Button>
    }

    renderWithAppContext(appContext) {
        let state = this.propertyBulkState('@all'),
            psDef = this.propertiesDefinition,
            itemsS1 = [
                {
                    badge: this.badge(state), content: 'All', icon: this.icon(state),
                    onAction: () => this.propertyBulkState('@all', !this.propertyBulkState('@all'))
                },
                {
                    content: 'Invert', icon: BulkInvertIcon,
                    onAction: () => this.propertyBulkState('@all', 'invert')
                }
            ],

            itemsS2 = (psDef.product || []).sort((a, b) => a.label >= b.label ? 1 : -1).map(pDef => {
                state = this.propertyBulkState(pDef.name);
                return {
                    badge: this.badge(state), content: (pDef.label || pDef.name), icon: this.icon(state),
                    onAction: () => this.propertyBulkState(pDef.name, !this.propertyBulkState(pDef.name))
                }
            });

        return (
            <Popover active={this.state.active} activator={this.renderActivator()} onClose={this.handleTogglePopover}>
                <ActionList
                    sections={[
                        { items: itemsS1, title: 'GLOBALS:' },
                        { items: [] },
                        { items: itemsS2, title: 'BY PROPERTY:' },
                    ]}/>
            </Popover>
        )
    }
}

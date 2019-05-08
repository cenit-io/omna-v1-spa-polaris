import React from 'react';
import {OMNAComponent} from "../common/OMNAComponent";
import {Utils} from "../common/Utils";

export class OMNAPageSection extends OMNAComponent {
    constructor(props) {
        super(props);
        this.state.notifications = [];
        this.state.notificationsLoaded = false;
    }

    renderNotifications(type, channel, resource_id) {
        const { appContext, notificationsLoaded } = this.state;

        if ( type !== undefined && notificationsLoaded === false && appContext.settings.status ) {
            Utils.loadNotifications(type, channel, resource_id, this);
            return Utils.renderLoading('small', 'Notifications...')
        } else {
            return Utils.renderNotifications(this.state.notifications)
        }
    }
}
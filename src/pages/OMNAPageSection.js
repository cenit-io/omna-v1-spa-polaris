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
        if ( type !== undefined && this.state.notificationsLoaded === false && this.isAuthenticated ) {
            let data = { type: type || '-' };

            if ( channel ) data.channel = channel;
            if ( resource_id ) data.resource_id = resource_id;

            this.loadingOn();
            this.xhr = $.getJSON({
                url: this.urlTo('notifications'),
                data: this.requestParams(data)
            }).done((notifications) => this.setState((prevState) => {
                prevState.notifications = prevState.notifications.concat(notifications);
                prevState.notificationsLoaded = true;
                return prevState;
            })).fail((response) => {
                const msg = 'Failed to load notifications. ' + Utils.parseResponseError(response);
                this.flashError(msg);
            }).always(() => this.loadingOff);

            return Utils.renderLoading('small', 'Notifications...')
        } else {
            return Utils.renderNotifications(this.state.notifications)
        }
    }
}
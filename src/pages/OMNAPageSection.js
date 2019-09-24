import React from 'react';
import {OMNAComponent} from "../common/OMNAComponent";
import {Utils} from "../common/Utils";

export class OMNAPageSection extends OMNAComponent {
    constructor(props) {
        super(props);
        this.state.notifications = [];
        this.state.notificationsLoaded = false;
        this.state.notificationsLoading = false;
    }

    renderNotifications(type, channel, resource_id, clean) {
        let { notificationsLoading, notificationsLoaded } = this.state;

        if (type !== undefined && notificationsLoaded === false && notificationsLoading === false && this.isAuthenticated) {
            this.state.notificationsLoading = true;

            let data = { type: type || '-' };

            if (channel) data.channel = channel;
            if (resource_id) data.resource_id = resource_id;
            if (clean === true) data.clean = true;

            this.loadingOn();
            this.xhr = $.getJSON({
                url: this.urlTo('notifications'),
                xhrFields: { withCredentials: true },
                data: this.requestParams(data)
            }).done((notifications) => this.setState((prevState) => {
                prevState.notifications = prevState.notifications.concat(notifications);
                prevState.notificationsLoaded = true;
                return prevState;
            })).fail((response) => {
                const msg = 'Failed to load notifications. ' + Utils.parseResponseError(response);
                this.flashError(msg);
            }).always(() => {
                this.state.notificationsLoading = false;
                this.loadingOff();
            });

            return Utils.renderLoading('small', 'Notifications...')
        } else {
            return Utils.renderNotifications(this.state.notifications)
        }
    }
}
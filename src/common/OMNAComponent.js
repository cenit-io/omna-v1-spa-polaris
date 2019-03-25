import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import {Badge} from '@shopify/polaris';
import {AppContext} from './AppContext'
import {Utils} from "./Utils";

export class OMNAComponent extends Component {

    constructor(props) {
        super(props);
        this.state = { appContext: {} };

        this.handleUninstall = this.handleUninstall.bind(this);
        this.loadingOn = this.loadingOn.bind(this);
        this.loadingOff = this.loadingOff.bind(this);
    }

    static get contextTypes() {
        return { polaris: PropTypes.any, easdk: PropTypes.object };
    }

    requestParams(data) {
        data = data || {};

        return $.extend({}, data, this.state.appContext.settings.URIs.base_params);
    }

    queryParams(data) {
        return $.param(this.requestParams(data));
    }

    urlTo(path) {
        return (this.state.appContext.settings.URIs.base_path + '/' + path.replace(/^\//, '')).replace(/\/\?/, '?');
    }

    get isInactive() {
        return this.state.appContext.settings.plan.status != 'active';
    }

    get activeChannels() {
        const { channels } = this.state.appContext.settings;
        let aChannels = [];

        Object.keys(channels).forEach((i) => channels[i].connected && aChannels.push(channels[i]));

        return aChannels
    }

    get channels() {
        return this.state.appContext.settings.channels
    }

    channelName(channel, short, withoutNotes) {
        channel = typeof channel === 'string' ? this.channels[channel] : channel;

        let status = (status) => <span className={"speech " + status}><Badge>{status}</Badge></span>,
            cName = channel.name.replace(/^(.*[^A-Z])([A-Z]+)$/, (name, prefix, acronym) => {
                return (short ? '' : prefix + '-') + Utils.countryName(acronym)
            });

        return withoutNotes ? cName : (
            <span className="channel-name">
                {cName}
                {channel.deprecated && status('Deprecate')}
                {channel.new && status('New')}
            </span>
        )
    }

    handleUninstall(e) {
        e.preventDefault();
        open('https://' + this.state.appContext.settings.URIs.base_params.shop + '/admin/apps', '_parent')
    }

    flashError(msg) {
        this.context.easdk && this.context.easdk.showFlashNotice(msg, { error: true }) || console.error(msg);
    }

    flashNotice(msg) {
        this.context.easdk && this.context.easdk.showFlashNotice(msg, { error: false }) || console.info(msg);
    }

    loadingOn() {
        this.context.easdk && this.context.easdk.startLoading() || console.info('LOADING-ON');
    }

    loadingOff() {
        if ( !(this.xhrs || []).find((x) => x.readyState != 4) ) {
            this.context.easdk && this.context.easdk.stopLoading() || console.info('LOADING-OFF');
        }
    }

    renderWithAppContext(appContext) {
        return '...'
    }

    render() {
        return (
            <AppContext.Consumer>
                {
                    (appContext) => {
                        this.state.appContext = appContext;
                        return this.renderWithAppContext(appContext)
                    }
                }
            </AppContext.Consumer>
        );
    }

    set timeoutHandle(value) {
        this.timeoutHandles = this.timeoutHandles || [];
        this.timeoutHandles.push(value)
    }

    set xhr(value) {
        this.xhrs = this.xhrs || [];
        this.xhrs = this.xhrs.filter((x) => x.readyState !== 4);
        this.xhrs.push(value)
    }

    componentWillUnmount() {
        this.abortPreviousTask()
    }

    abortPreviousTask() {
        this.timeoutHandles && this.timeoutHandles.forEach((h) => clearTimeout(this.h));
        this.xhrs && this.xhrs.forEach((xhr) => xhr.readyState != 4 && xhr.abort());
        this.timeoutHandles = [];
        this.xhrs = [];
    }
}
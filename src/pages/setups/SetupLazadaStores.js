import React from 'react';
import {SetupStores} from "./SetupStores";
import {SetupLazadaStore} from "./SetupLazadaStore";
import {Utils} from "../../common/Utils";

export class SetupLazadaStores extends SetupStores {

    tab(channel) {
        let acronym = channel.replace(/^Lazada/, '');

        return {
            id: 'setup-' + channel + '-tab',
            content: this.channelName(channel, true),
            channel: channel,
            domain: 'api.lazada.' + Utils.countryDomain(acronym)
        }
    }

    get tabs() {
        let tabs = [];

        Object.keys(this.channels).forEach((channel) => {
            if ( channel.match(/^Lazada/) ) {
                let { connected, deprecated } = this.channels[channel];

                if ( connected || !deprecated ) tabs.push(this.tab(channel))
            }
        });

        return tabs
    }

    renderStoreSettings() {
        const { channel, domain } = this.selectedTab;

        return <SetupLazadaStore channel={channel} domain={domain}/>
    }
}
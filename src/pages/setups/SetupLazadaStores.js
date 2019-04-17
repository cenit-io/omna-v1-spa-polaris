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
            country: Utils.countryName(acronym),
            channel: channel
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
        let { channel, country } = this.selectedTab;

        return <SetupLazadaStore channel={channel} country={country}/>
    }
}
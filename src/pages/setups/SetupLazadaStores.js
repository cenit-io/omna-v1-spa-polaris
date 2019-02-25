import React from 'react';
import {SetupStores} from "./SetupStores";
import {SetupLazadaStore} from "./SetupLazadaStore";

export class SetupLazadaStores extends SetupStores {

    tab(channel) {
        let acronym = channel.replace(/^Lazada/, '');

        return {
            id: 'setup-' + channel + '-tab',
            content: this.channelName(channel, true),
            channel: channel,
            domain: 'api.lazada.' + this.countryDomain(acronym)
        }
    }

    get tabs() {
        let tabs = [];

        Object.keys(this.channels).forEach((channel) => {
            channel.match(/^Lazada[A-Z]+/) && tabs.push(this.tab(channel))
        });

        (this.channels.Lazada || {}).connected && tabs.unshift({
            id: 'setup-lazada-legacy-tab',
            content: 'Legacy',
            channel: 'Lazada',
        });

        return tabs
    }

    renderStoreSettings() {
        return <SetupLazadaStore tabSettings={() => this.selectedTab}/>
    }
}
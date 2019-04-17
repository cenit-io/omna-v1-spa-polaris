import React from 'react';
import {SetupStores} from "./SetupStores";
import {SetupShopeeStore} from "./SetupShopeeStore";
import {Utils} from "../../common/Utils";

export class SetupShopeeStores extends SetupStores {

    tab(channel) {
        let acronym = channel.replace(/^Shopee/, '');

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
            if ( channel.match(/^Shopee/) ) {
                let { connected, deprecated } = this.channels[channel];

                if ( connected || !deprecated ) tabs.push(this.tab(channel))
            }
        });

        return tabs
    }

    renderStoreSettings() {
        const { channel, country } = this.selectedTab;

        return <SetupShopeeStore channel={channel} country={country}/>
    }
}
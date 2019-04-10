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
            channel: channel,
            domain: 'api.shopee.' + Utils.countryDomain(acronym)
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
        const { channel, domain } = this.selectedTab;

        return <SetupShopeeStore channel={channel} domain={domain}/>
    }
}
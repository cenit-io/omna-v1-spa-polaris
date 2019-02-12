import React from 'react';
import {SetupStores} from "./SetupStores";
import {SetupLazadaStore} from "./SetupLazadaStore";

export class SetupLazadaStores extends SetupStores {
    get tabs() {
        let tabs = [
            {
                id: 'setup-lazada-sg-tab',
                content: 'Singapore',
                channel: 'LazadaSG',
                domain: 'api.lazada.sg'
            },
            {
                id: 'setup-lazada-my-tab',
                content: 'Malaysia',
                channel: 'LazadaMY',
                domain: 'api.lazada.com.my'
            }
        ];

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



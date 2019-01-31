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
            },
            {
                id: 'setup-lazada-my-tab',
                content: 'Malaysia',
                channel: 'LazadaMY',
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
        return <SetupLazadaStore parent={this}/>
    }
}



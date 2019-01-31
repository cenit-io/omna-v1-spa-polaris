import React from 'react';
import {SetupStores} from "./SetupStores";
import {SetupLazadaStore} from "./SetupLazadaStore";

export class SetupLazadaStores extends SetupStores {
    get tabs() {
        return [
            {
                id: 'setup-lazada-legacy-tab',
                content: 'Legacy',
                channel: 'Lazada',
            },
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
        ]
    }

    renderStoreSettings() {
        return <SetupLazadaStore parent={this}/>
    }
}



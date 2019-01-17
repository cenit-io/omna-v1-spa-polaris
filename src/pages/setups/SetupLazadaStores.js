import React from 'react';
import {SetupStores} from "./SetupStores";
import {SetupLazadaStore} from "./SetupLazadaStore";

export class SetupLazadaStores extends SetupStores {
    get tabs() {
        return [
            {
                id: 'setup-lazada-sg-tab',
                content: 'Singapore',
                country: 'SG',
            },
            {
                id: 'setup-lazada-my-tab',
                content: 'Malaysia',
                country: 'MY',
            }
        ]
    }

    renderStoreSettings() {
        return <SetupLazadaStore parent={this}/>
    }
}



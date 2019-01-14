import React from 'react';
import {TabsPage} from '../TabsPage';
import {SetupOMNA} from './SetupOMNA';
import {SetupQoo10} from './SetupQoo10';
import {SetupLazada} from './SetupLazada';
import {SetupShopee} from './SetupShopee';

export class SetupPage extends TabsPage {
    constructor(props) {
        super(props);
        this.state.subTitle = 'Setup sale channels';
    }

    getSectionTitle(tab) {
        return 'Settings off ' + tab.content + (tab.content === 'OMNA' ? ':' : ' sale channel:')
    }

    isAvailableChannel(name) {
        return this.state.appContext.settings.channels[name] !== null
    }

    tabs() {
        const tabs = [{
            id: 'setup-omna-tab',
            content: 'OMNA',
            body: <SetupOMNA/>
        }];

        if ( this.isAvailableChannel('Lazada') ) tabs.push({
            id: 'setup-lazada-tab',
            content: 'Lazada',
            body: <SetupLazada/>
        });

        if ( this.isAvailableChannel('Qoo10') ) tabs.push({
            id: 'setup-qoo10-tab',
            content: 'Qoo10',
            body: <SetupQoo10/>
        });

        if ( this.isAvailableChannel('Shopee') ) tabs.push({
            id: 'setup-shopee-tab',
            content: 'Shopee',
            body: <SetupShopee/>
        });

        return tabs
    }
}

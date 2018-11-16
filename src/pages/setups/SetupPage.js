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

    isAvailable(channel) {
        const channels = this.state.appContext.settings.channels || 'all';

        return channels === 'all' || channels.indexOf(channel) != -1
    }

    tabs() {
        const
            channels = this.state.appContext.settings.channels || 'all',
            tabs = [{
                id: 'setup-omna-tab',
                content: 'OMNA',
                body: <SetupOMNA/>
            }];

        if ( this.isAvailable('Lazada') ) tabs.push({
            id: 'setup-lazada-tab',
            content: 'Lazada',
            body: <SetupLazada/>
        });

        if ( this.isAvailable('Qoo10') ) tabs.push({
            id: 'setup-qoo10-tab',
            content: 'Qoo10',
            body: <SetupQoo10/>
        });

        if ( this.isAvailable('Shopee') ) tabs.push({
            id: 'setup-shopee-tab',
            content: 'Shopee',
            body: <SetupShopee/>
        });

        return tabs
    }
}

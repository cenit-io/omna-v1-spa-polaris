import React from 'react';
import {TabsPage} from './Commons';
import {SetupOMNA} from './SetupOMNA';
import {SetupQoo10} from './SetupQoo10';
import {SetupLazada} from './SetupLazada';

export class SetupPage extends TabsPage {
    constructor(props) {
        super(props);
        this.state.subTitle = 'Setup sale channels';
    }

    getSectionTitle(tab) {
        return 'Settings off ' + tab.content + (tab.content == 'OMNA' ? ':' : ' sale channel:')
    }

    tabs() {
        return [
            {
                id: 'setup-omna-tab',
                content: 'OMNA',
                body: <SetupOMNA/>
            },
            {
                id: 'setup-lazada-tab',
                content: 'Lazada',
                body: <SetupLazada/>
            },
            {
                id: 'setup-qoo10-tab',
                content: 'Qoo10',
                body: <SetupQoo10/>
            }
        ]
    }
}

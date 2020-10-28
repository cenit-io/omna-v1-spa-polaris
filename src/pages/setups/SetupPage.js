import React from 'react';
import { TabsPage } from '../TabsPage';
import { SetupOMNA } from './SetupOMNA';
import { SetupQoo10Store } from './SetupQoo10Store';
import { SetupLazadaStores } from './SetupLazadaStores';
import { SetupShopeeStores } from './SetupShopeeStores';

export class SetupPage extends TabsPage {
  constructor(props) {
    super(props);
    this.state.subTitle = 'Setup sale channels';
  }

  get sectionTitle() {
    const sTab = this.selectedTab;

    return 'Settings off ' + sTab.content + sTab.suffixTitle + ':'
  }

  isAvailableChannel(name) {
    return Object.keys(this.channels).find((n) => n.match(name))
  }

  get tabs() {
    const tabs = [{
      id: 'setup-omna-tab',
      content: 'OMNA',
      suffixTitle: '',
      body: <SetupOMNA />
    }];

    if (this.isAvailableChannel('Lazada')) tabs.push({
      id: 'setup-lazada-tab',
      content: 'Lazada',
      suffixTitle: ' sale channels by countries',
      body: <SetupLazadaStores />
    });

    if (this.isAvailableChannel('Qoo10')) tabs.push({
      id: 'setup-qoo10-tab',
      content: 'Qoo10',
      suffixTitle: ' sale channel',
      body: <SetupQoo10Store />
    });

    if (this.isAvailableChannel('Shopee')) tabs.push({
      id: 'setup-shopee-tab',
      content: 'Shopee',
      suffixTitle: ' sale channels by countries',
      body: <SetupShopeeStores />
    });

    return tabs
  }
}

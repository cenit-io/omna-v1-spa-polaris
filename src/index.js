import React from 'react';
import {Utils} from './common/Utils';

import './common/Array';
import './images/omna_logo.png';
import './index.css';

let queryParams = window.location.search,
    urlParams = new URLSearchParams(queryParams),
    page = urlParams.has('pg') ? urlParams.get('pg') : 'home',
    fromCache = urlParams.has('cache'),
    settings = fromCache && Utils.getSessionItem('omna-settings');

if ( !Utils.isLocal ) Utils.delSessionItem('products-items');

if ( Utils.isLocal && settings ) {
    Utils.renderPage(page, null, settings);
} else {
    Utils.loadSettings({}).then((settings) => Utils.renderPage(page, null, settings))
}
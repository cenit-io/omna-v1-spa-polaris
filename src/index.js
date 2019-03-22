import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './App';
import {Utils} from './common/Utils';

import './common/Array';
import './images/omna_logo.png';
import './index.css';

var queryParams = window.location.search,
    urlParams = new URLSearchParams(queryParams),
    appDomainName = window.location.hostname.split('.')[0],
    isLocal = appDomainName.match(/^(127.0|localhost)/i) != null,
    serverDomain = urlParams.has('serverDomain') ? urlParams.get('serverDomain') : 'cenit.io',
    settingsPath = urlParams.has('settingsPath') ? urlParams.get('settingsPath') : '/app/' + appDomainName + '.json',

    startApp = (appSettings) => {
        if ( appSettings && appSettings.status === 'unauthorized' ) {
            return window.open(appSettings.authorize_uri, '_parent');
        }

        window.OMNA = {
            render(page, data) {
                const domElement = document.getElementById('page-content');

                ReactDOM.render(<App page={page} data={data} appSettings={appSettings} isLocal={isLocal}/>, domElement);
            }
        };

        window.OMNA.render(urlParams.has('pg') ? urlParams.get('pg') : 'home');
    };

if ( isLocal ) {
    queryParams = '?' + $.param({
        shop: 'omna-develop.myshopify.com',
        timestamp: 1539373481,
        hmac: '1b8e67c7f329d8314a493da1ecf28c6944b3c2ccb65988d5ebc990317539050d'
    });
    settingsPath = '/app/omna-dev.json'
} else {
    Utils.delSessionItem('products-items');
}

if ( queryParams ) {
    let fromCache = urlParams.has('cache'),
        settings = fromCache && Utils.getSessionItem('omna-settings');

    if ( isLocal && settings ) {
        startApp(settings);
    } else {
        $.getJSON('https://' + serverDomain + settingsPath + queryParams).done((response) => {
            isLocal && fromCache && Utils.setSessionItem('omna-settings', response.settings);
            startApp(response.settings);
        }).fail((response) => {
            let error = Utils.parseResponseError(response);
            console.error(error);
            alert(error);
        });
    }
} else {
    startApp({});
}
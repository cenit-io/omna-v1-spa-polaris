import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './App';

import './index.css'

var queryParams = window.location.search,
    urlParams = new URLSearchParams(queryParams),
    isLocal = window.location.host.match(/^(127.0|localhost)/i) != null,

    startApp = (appSettings) => {
        if ( appSettings && appSettings.status === 'unauthorized' ) {
            return window.location = appSettings.authorize_uri;
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
} else {
    window.sessionStorage.removeItem('products-items');
}

if ( queryParams ) {
    $.getJSON('https://cenit.io/app/omna-v1m2rx.json' + queryParams).done((response) => {
        startApp(response.settings);
    }).fail((response) => {
        const error = response.responseJSON ? response.responseJSON : response.responseText;
        console.error(error);
        alert(error.error || error);
    });
} else {
    startApp({});
}



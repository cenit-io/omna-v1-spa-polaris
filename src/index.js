import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './App';

import './index.css'

window.OMNA = {
    render(page, data) {
        ReactDOM.render(<App page={page} data={data}/>, document.getElementById('page-content'));
    },

    settings: window.settings,

    propertiesDefinitions: {}
};

window.OMNA.render(window.OMNAPage || 'home');
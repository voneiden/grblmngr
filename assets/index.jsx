/**
 GrblMgmr is a frontend application to interface with Grbl via GrblMQTT
 Copyright (C) 2016 Matti Eiden

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader'
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import Grblmgmr from './Grblmgmr';


import {MQTT, SERIAL, GRBL} from "./constants";
console.log("Init grblmgmr");

const rootContainer = 'grblmgmr-container';


const initialState = {
    mqtt: {
        state: MQTT.DISCONNECTED
    },
    serial: {
        state: SERIAL.DISCONNECTED,
        ports: null
    },
    grbl: {
        state: GRBL.IDLE,
        X: null,
        Y: null,
        Z: null
    }
};

function rootReducer(state = initialState, action) {
    switch(action.type) {
        default:
            return Object.assign({}, state);
    }
}

const store = createStore(rootReducer);

function init() {
    ReactDOM.render(
        <AppContainer>
            <Provider store={store}>
                <Grblmgmr/>
            </Provider>
        </AppContainer>, document.getElementById(rootContainer));

}

init();

if (module.hot) {
    module.hot.accept('./Grblmgmr', () => {
        ReactDOM.render(
            <AppContainer>
                <Provider store={store}>
                    <Grblmgmr/>
                </Provider>
            </AppContainer>,
            document.getElementById(rootContainer)
        );
    });
}
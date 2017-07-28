/**
 GrblMgmr is a frontend application to interface with Grbl via GrblMQTT
 Copyright (C) 2016-2017 Matti Eiden

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
import MqttProtocol from 'utils/MqttProtocol';

import {MqttState, SerialState, GrblState} from "./GMConstants";
import {MqttAction, SerialAction, GrblAction} from "./GMConstants";
console.log("Init grblmgmr");

const rootContainer = 'grblmgmr-container';


const initialState = {
    mqtt: {
        state: MqttState.DISCONNECTED
    },
    serial: {
        state: SerialState.DISCONNECTED,
        ports: null
    },
    grbl: {
        state: GrblState.IDLE,
        X: null,
        Y: null,
        Z: null
    }
};

function rootReducer(state = initialState, action) {
    let serial;
    switch(action.type) {
        case MqttAction.SET_STATE:
            return Object.assign({}, state, {
                mqtt: {
                    state: action.value
                }
            });

        case SerialAction.SET_STATE:
            serial = Object.assign({}, state.serial, {state: action.value});
            return Object.assign({}, state, {serial: serial});

        case SerialAction.SET_PORTS:
            serial = Object.assign({}, state.serial, {ports: action.value});
            return Object.assign({}, state, {serial: serial});


        case GrblAction.SET_STATE:
            return Object.assign({}, state, {
                grbl: {
                    state: action.value
                }
            });

        default:
            return Object.assign({}, state);
    }
}

const store = createStore(rootReducer);
MqttProtocol.setStore(store);

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
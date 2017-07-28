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

import MqttClient from './MqttClient';
let okCallbacks = [];

export default class GrblSender {
    constructor() {

    }

    static sendMessage(message, onOkCallback) {
        MqttClient.publish("grbl/in/message", message);
        okCallbacks.push(onOkCallback);
    }

    static sendRealtime(message, onOkCallback) {
        MqttClient.publish("grbl/in/realtime", message);
        okCallbacks.push(onOkCallback);
    }

    static handleOk() {
        console.log("handle ok");
        if (okCallbacks.length) {
            let callback = okCallbacks.shift();
            if (callback) {
                callback();
            }
        }
    }

    static handleError(error) {
        if (okCallbacks.length) {
            let callback = okCallbacks.shift();
            if (callback) {
                callback(error);
            }
        }
    }

}
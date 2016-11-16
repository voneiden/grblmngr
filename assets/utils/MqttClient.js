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

import mqtt from 'mqtt';



console.log("MQTT", mqtt);

let client = null;


export default class RestClient {

    static connect(mqttUrl, custom_options={}, onConnect, onError, onMessage, onClose) {
        let options = Object.assign({}, custom_options);



        client = mqtt.connect("ws://" + mqttUrl);
        client.on("connect", onConnect);
        client.on("error", onError);
        client.on("close", onClose);
        client.on("message", onMessage);
    }

    static publish(topic, message, custom_options={}, onDone) {
        if (client != null && client.connected) {
            let options = Object.assign({}, custom_options);
            client.publish(topic, message, options, onDone);
        }
    }

    static subscribe(topic, custom_options={}, onDone) {
        if (client != null && client.connected) {
            let options = Object.assign({}, custom_options);
            client.subscribe(topic, options, onDone);
        }
    }

    static unsubscribe(topic, onDone) {
        if (client != null && client.connected) {
            client.unsubscribe(topic, onDone);
        }
    }

}
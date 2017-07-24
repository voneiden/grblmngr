/**
 GrblMgmr is a frontend application to interface with Grbl via GrblMQTT
 Copyright (C) 2017 Matti Eiden

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


 MachineState provides an interface to manipulate the CNC machine state

 */

import React from 'react';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import MqttClient from './MqttClient';
import GrblSender from './GrblSender';


export class MqttProtocol extends React.Component {
    constructor(props) {
        super(props);
        this._client = null;
        autoBind(this);
    }

    connect(mqttUrl, customOptions) {
        if (this.client) {
            throw "Must close client before attempting to connect to a new one";
        }
        // TODO
        this._client = MqttClient.connect(mqttUrl, customOptions, this.onConnect, this.onError, this.onMessage, this.onClose)
        //this.props.setConnectionState(ConnectionState.CONNECTING);
    }

    onConnect() {
        this.setState({
            mqtt: {
                connected: true,
                connecting: false
            }
        });

        //this.props.setConnectionState(ConnectionState.CONNECTED);

        console.log("CONNECTED");
        MqttClient.subscribe("grbl/serial/+/response", {qos: 0});
        MqttClient.subscribe("grbl/out/#", {qos: 0});
        MqttClient.subscribe("grbl/status", {qos: 0});
        MqttClient.publish("grbl/serial/status");
    }

    onError(error) {
        console.warn("MqttState error", error);
        //this.props.setConnectionState(ConnectionState.DISCONNECTED);
    }

    onMessage(topic, message, packet) {
        message = message.toString("utf8");
        topic = topic.split("/");


        switch (topic[0]) {
            case "grbl":
                switch (topic[1]) {
                    case "status":
                        this.grblParseStatusReport(message);
                        break;

                    case "out":
                        if (message === "ok") {
                            GrblSender.handleOk();
                        }
                        else if (message.indexOf("error") === 0) {
                            GrblSender.handleError(message.split(":")[1]);
                        }
                        else {
                            console.warn("Out not supported:", topic, message);
                        }
                        break;

                    case "serial":
                        switch (topic[2]) {
                            case "status":
                                let connected = message === "1";
                                // Fetch automatically port list
                                if (!connected) {
                                    console.log("Request serial list");
                                    MqttClient.publish("grbl/serial/list");
                                }
                                //this.props.setSerialState(ConnectionState.CONNECTED);
                                break;

                            case "list":
                                console.log("Received serial ports");
                                this.props.setSerialPorts(JSON.parse(message));
                                break;

                            default:
                                console.warn("Unknown serial subtopic");
                        }
                        break;

                    default:
                        console.warn("Unknown grbl subtopic");
                }
                break;

            default:
                console.warn("Unimplemented topic");
        }
    }

    onClose(error) {
        console.log("CLOSED", error);
        //this.props.setConnectionState(ConnectionState.DISCONNECTED);
    }

    grblParse(data) {
        if (data == null || data.length == 0) {
            console.warn("Empty data");
            return false
        }
        else if (data[0] == "<") {
            return this.grblParseStatusReport(data);
        }
        else {
            console.warn("Unknown data:", data);
            return false;
        }
    }

    grblParseStatusReport(raw) {
        let raw_params = raw.substr(1, raw.length - 2).split("|");
        let params = {};
        for (let i=0; i < raw_params.length; i++) {
            let param = raw_params[i].split(':');
            if (i === 0) {
                params.state = param[0];
            }
            else {
                params[param[0]] = param[1].split(",");
            }
        }

        let mergedParams = Object.assign(this.state.grbl.status, params);
        this.setState({"grbl": {"status": mergedParams}});
    }

    render() {
        return null;
    }
}

MqttProtocol.propTypes = {
    setConnectionState: PropTypes.func.isRequired,
    setSerialState: PropTypes.func.isRequired,
    setSerialPorts: PropTypes.func.isRequired,
};
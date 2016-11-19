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
import './styles/main.scss';
import classNames from 'classnames';

import MqttClient from './utils/MqttClient';
import GrblSender from './utils/GrblSender';

import './styles/mui.scss';

import Appbar from 'muicss/lib/react/appbar';
import Button from 'muicss/lib/react/button';
import Container from 'muicss/lib/react/container';

import Sidebar from './components/nav/Sidebar';
import SidebarToggle from './components/nav/SidebarToggle';

import Workspace from './components/workspace/Workspace';

import Clone from './utils/Clone';

import ConnectView from './components/views/ConnectView';
import SerialView from './components/views/SerialView';

//import GrblInterface from './utils/GrblInterface';

// Where is the right place to track machine state?)


//Idle, Run, Hold, Jog, Alarm, Door, Check, Home, Sleep

export default class Grblmgmr extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sidebarForceVisible: false,
            mqtt: {
                connected: false,
                connecting: false
            },
            serial: {
                connecting: false,
                connected: null,
                ports: null
            },
            grbl: {
                status: {}
            }


        };

        this.handleMqttConnect = this.handleMqttConnect.bind(this);

        this.grblParse = this.grblParse.bind(this);
        this.grblParseStatusReport = this.grblParseStatusReport.bind(this);
    }

    handleMqttConnect(mqttUrl) {
        this.setState({
            mqtt: {
                connecting: true
            }
        });
        MqttClient.connect(
            mqttUrl,
            {},

            // On connect
            function() {
                this.setState({
                    mqtt: {
                        connected: true,
                        connecting: false
                    }
                });
                console.log("CONNECTED");
                MqttClient.subscribe("grbl/serial/+/response", {qos: 0});
                MqttClient.subscribe("grbl/out/#", {qos: 0});
                MqttClient.subscribe("grbl/status", {qos: 0});
                MqttClient.publish("grbl/serial/status");

            }.bind(this),


            // On error
            function (error) {
                console.warn("MQTT error", error);

            }.bind(this),

            // On message
            function(topic, message, packet) {

                message = message.toString("utf8");
                topic = topic.split("/");


                switch (topic[0]) {
                    case "grbl":
                        switch (topic[1]) {
                            case "status":
                                this.grblParseStatusReport(message);
                                break;

                            case "out":
                                if (message == "ok") {
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
                                        let connected = message == "1";
                                        // Fetch automatically port list
                                        if (!connected) {
                                            console.log("Request serial list");
                                            MqttClient.publish("grbl/serial/list");
                                        }
                                        this.setState({serial: {connected: connected}});
                                        break;

                                    case "list":
                                        console.log("Received serial ports");
                                        this.setState({serial: {ports: JSON.parse(message)}});
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
            }.bind(this),

            // On close
            function(error) {
                console.log("CLOSED", error);
                // TODO a method to cancel the autoreconnect

                this.setState({
                    mqtt: {
                        connected: false
                    },
                    grbl: {
                        status: {
                            state: "Unknown"
                        }
                    }
                });
            }.bind(this)
        );
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
        for (var i=0; i < raw_params.length; i++) {
            let param = raw_params[i].split(':');
            if (i == 0) {
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
        /* Determine if we need to render connect view, serial view or workspaces */
        let contentView;
        if (!this.state.mqtt.connected) {
            contentView = <ConnectView connectCallback={ this.handleMqttConnect } connecting={ this.state.mqtt.connecting }/>
        }
        else if (!this.state.serial.connected) {
            contentView = <SerialView ports={this.state.serial.ports}/>
        }
        else {
            let grblState = Clone.deep(this.state.grbl.status);
            contentView = <Workspace grblState={ grblState }/>
        }

        //contentView = <Workspace grblState={this.state.grbl.status}/>
        let views = ["ConnectView"];
        return (
            <div id ="grblmgmr-root" className="flex flex-row">
                <Sidebar forceVisible={ this.state.sidebarForceVisible }/>
                <div id="main" className="flex-grow flex flex-column">
                    <div id="topnav" className="flex flex-row flex-align-center">
                        <SidebarToggle sidebarToggle={ () => this.setState({ sidebarForceVisible: !this.state.sidebarForceVisible }) } />
                    </div>
                    { contentView }
                </div>
            </div>
        );
    }
}
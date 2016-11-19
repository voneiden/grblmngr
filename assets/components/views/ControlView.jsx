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

// Control view displays machine state and provides controls for operating the machine

import React from 'react';
import classnames from 'classnames';
import Form from 'muicss/lib/react/form';
import Input from 'muicss/lib/react/input';
import Button from 'muicss/lib/react/button';

import StorageUtil from '../../utils/StorageUtil';

import MqttClient from '../../utils/MqttClient';
import GrblSender from '../../utils/GrblSender';



export default class ControlView extends React.Component {
    constructor(props) {
        console.log("Constructing a COntrolView");
        super(props);
        this.state = {
            jogging : false,
            jogVector: {
                x: 0,
                y: 0,
                z: 0
            }
        };

        this.updateJog = this.updateJog.bind(this);
        this.doJog = this.doJog.bind(this);
        this.stopJog = this.stopJog.bind(this);
        this.optimalIncrementDistance = this.optimalIncrementDistance.bind(this);

    }

    optimalIncrementDistance() {
        let v = 100 / 60; // Jogging feedrate in mm/sec
        let N = 15; // Planner blocks
        let a = 100; // Acceleration in mm/sec2
        let dt = Math.max(0.01, Math.pow(v, 2) / (2 * a * (N - 1)));
        return v * dt;

    }

    updateJog(x=0, y=0, z=0) {
        let wasJogging = this.state.jogging;

        // Normalize vectors
        let magnitude = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
        x /= magnitude;
        y /= magnitude;
        z /= magnitude;

        let newState = this.state;
        newState.jogging = true;
        newState.jogVector.x = x;
        newState.jogVector.y = y;
        newState.jogVector.z = z;

        this.setState(newState);

        if (!wasJogging) {
            this.doJog();
        }
    }

    doJog(error) {
        if (error) {
            console.warn("Error occured:", error);
        }
        else if (this.state.jogging) {
            let increment = this.optimalIncrementDistance();
            let v = this.state.jogVector;
            let message = `$J=G91 X${v.x * increment}Y${v.y * increment}Z${v.z * increment} F100`;
            GrblSender.sendMessage(message, this.doJog);
        } else {
            console.log("doJog skipping publish..");
        }
    }

    stopJog() {
        //
        this.state.jogging = false;
        this.setState(this.state);
        return;
        if (this.props.grblState.state == "Idle") {
            console.log("stopJog");
            MqttClient.publish("grbl/in/realtime", "\x85");
            //MqttClient.publish("grbl/in/message", "$J=G91 X10 F100");
        }
    }



    render() {
        if (!this.props.grblState.state) {
            return (<div>Waiting for grbl status..</div>);
        }

        let machinePosition = this.props.grblState.MPos;
        if (machinePosition) {
            machinePosition = machinePosition.join(", ");
        }

        return (
            <div>
                <div>Machine state: {this.props.grblState.state}</div>
                <div>Machine position: { machinePosition }</div>
                <div>Buffer state: {this.props.grblState.Bf}</div>
                <div>
                    <Button color="primary" onMouseDown={ function() { this.updateJog(-1, 1, 0) }.bind(this) } onMouseUp={ this.stopJog } onMouseLeave={ this.stopJog }>↖</Button>
                    <Button color="primary" onMouseDown={ function() { this.updateJog(0, 1, 0) }.bind(this) } onMouseUp={ this.stopJog } onMouseLeave={ this.stopJog }>↑</Button>
                    <Button color="primary" onMouseDown={ function() { this.updateJog(1, 1, 0) }.bind(this) } onMouseUp={ this.stopJog } onMouseLeave={ this.stopJog }>↗</Button>
                </div>
                <div>
                    <Button color="primary" onMouseDown={ function() { this.updateJog(-1, 0, 0) }.bind(this) } onMouseUp={ this.stopJog } onMouseLeave={ this.stopJog }>←</Button>
                    <Button></Button>
                    <Button color="primary" onMouseDown={ function() { this.updateJog(1, 0, 0) }.bind(this) } onMouseUp={ this.stopJog } onMouseLeave={ this.stopJog }>→</Button>
                </div>
                <div>
                    <Button color="primary" onMouseDown={ function() { this.updateJog(-1, -1, 0) }.bind(this) } onMouseUp={ this.stopJog } onMouseLeave={ this.stopJog }>↙</Button>
                    <Button color="primary" onMouseDown={ function() { this.updateJog(0, -1, 0) }.bind(this) } onMouseUp={ this.stopJog } onMouseLeave={ this.stopJog }>↓</Button>
                    <Button color="primary" onMouseDown={ function() { this.updateJog(1, -1, 0) }.bind(this) } onMouseUp={ this.stopJog } onMouseLeave={ this.stopJog }>↘</Button>
                </div>
            </div>
        );
    }
}

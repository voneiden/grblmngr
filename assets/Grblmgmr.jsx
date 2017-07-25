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
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {MqttState, SerialState} from './GMConstants';

import './styles/main.scss';
import classNames from 'classnames';

import MqttClient from './utils/MqttClient';
import MqttProtocol from 'utils/MqttProtocol';
import GrblSender from './utils/GrblSender';

import './styles/mui.scss';

import Workspace from './components/workspace/Workspace';

import Clone from './utils/Clone';

import ConnectView from './components/views/ConnectView';
import SerialView from './components/views/SerialView';

//import GrblInterface from './utils/GrblInterface';

// Where is the right place to track machine state?)


//Idle, Run, Hold, Jog, Alarm, Door, Check, Home, Sleep

class Grblmgmr extends React.Component {
    constructor(props) {
        super(props);
        this._mqttProtocol = null;
        autoBind(this);
    }

    doMqttConnect(mqttUrl) {
        MqttProtocol.connect(mqttUrl, {});
    }

    render() {
        /* Determine if we need to render connect view, serial view or workspaces */
        let contentView;
        if (this.props.mqttState !== MqttState.CONNECTED) {
            contentView = <ConnectView doConnect={ this.doMqttConnect }/>
        }
        else if (this.props.serialState !== SerialState.CONNECTED) {
            contentView = <SerialView/>
        }
        else {
            // TODO
            //let grblState = Clone.deep(this.state.grbl.status);
            contentView = <Workspace/>
        }

        //contentView = <Workspace grblState={this.state.grbl.status}/>
        let views = ["ConnectView"];
        return (
            <div id ="grblmgmr-root" className="flex flex-row">
                <div id="main" className="flex-grow flex flex-column">
                    <div id="topnav" className="flex flex-row flex-align-center">
                    </div>
                    { contentView }
                </div>
            </div>
        );
    }
}

Grblmgmr.propTypes = {
    mqttState: PropTypes.symbol,
    serialState: PropTypes.symbol
};

function mapStateToProps(state) {
    return {
        mqttState: state.mqtt.state,
        serialState: state.serial.state
    };
}
export default connect(mapStateToProps)(Grblmgmr);
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
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import {connect} from 'react-redux';
import classnames from 'classnames';
import Form from 'muicss/lib/react/form';
import Input from 'muicss/lib/react/input';
import Button from 'muicss/lib/react/button';

import StorageUtil from '../../utils/StorageUtil';

import MqttClient from '../../utils/MqttClient';

export default class SerialView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {connecting: false};
        autoBind(this);
    }

    handleSerialPortOpen(event) {
        event.preventDefault();
        let comName = event.target.name;
        MqttClient.publish("grbl/serial/open", comName);
        this.setState({connecting: true});
    }

    handleSerialPortRefresh(event) {
        event.preventDefault();
        console.log("Handle serial refresh")
    }

    render() {
        console.log(this.state.mqttUrl);
        // TODO this is way too ugly
        if (this.props.ports === null) {
            return this.renderFetchingPorts();
        }
        else {
            return this.renderPortList();
        }
    }

    renderFetchingPorts() {
        return (
            <div>SerialView waiting for ports..
            </div>
        );
    }
    renderPortList() {
        // TODO handle ports.error
        let onClickCallback = this.handleSerialPortOpen;
        let ports = this.props.ports.ports.map(function (port, index) {
            return <Button
                color="primary"
                key={ "port-btn-" + index }
                name={ port.comName }
                onClick={ onClickCallback }>{port.comName}</Button>
        });

        return (
            <div>
                <h1>Open port</h1>
                <Form onSubmit={ this.handleSerialOpen }>
                    { ports }
                    <p/>
                    <Button color="primary" onClick={ this.handleSerialPortRefresh }>Refresh</Button>;
                </Form>
            </div>
        );
    }
}

SerialView.propTypes = {
    dispatch: PropTypes.func.isRequired,
    doConnect: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
    }
}
export default connect(mapStateToProps)(SerialView);
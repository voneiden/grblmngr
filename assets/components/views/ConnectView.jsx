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
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import {connect} from 'react-redux';
import classnames from 'classnames';
import Form from 'muicss/lib/react/form';
import Input from 'muicss/lib/react/input';
import Button from 'muicss/lib/react/button';

import StorageUtil from '../../utils/StorageUtil';

class ConnectView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mqttUrl: StorageUtil.get("mqttUrl", "localhost:1886")
        };
        autoBind(this);
    }

    handleConnectSubmit(event) {
        console.log("Submit");
        event.preventDefault();
        this.props.doConnect(this.state.mqttUrl);
    }

    handleMqttUrlChange(event) {
        this.setState({
            mqttUrl: event.target.value
        });
    }

    render() {
        console.log(this.state.mqttUrl);
        return (
            <div>ConnectView
                <Form onSubmit={ this.handleConnectSubmit }>
                    <Input label="MQTT url" value={ this.state.mqttUrl } onChange= { this.handleMqttUrlChange }></Input>
                    <Button color="primary">Connect</Button>
                </Form>
            </div>
        );
    }
}

ConnectView.propTypes = {
    dispatch: PropTypes.func,
    doConnect: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
    }
}
export default connect(mapStateToProps)(ConnectView);
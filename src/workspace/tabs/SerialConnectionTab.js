import React, { Component } from 'react';
import {observer} from 'mobx-react';

import connectionStore from '../../stores/connectionStore';

class SerialConnectionTab extends React.Component {
    render() {
        if (connectionStore.serialport) {
            let ports = null;
            console.log("Render ports", connectionStore.ports);
            if (connectionStore.ports) {
                ports = connectionStore.ports.map((port) => (
                    <div>{ port.comName }</div>
                ));
            }
            return (
                <div>
                    <div>Hello from serial connection tab</div>
                    <div>{ connectionStore.portInfo }</div>
                    {ports}
                    <button onClick={ () => connectionStore.refreshPorts() }>Refresh</button>
                </div>
            )
        } else {
            return (
                <div>
                    Serialport module is not available
                </div>
            )
        }
    }
}

export default observer(SerialConnectionTab);

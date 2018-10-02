import React, { Component } from 'react';
import {observer} from 'mobx-react';
import connectionStore from '../../stores/connectionStore';

class Workspace extends React.Component {
    render() {
        return (
            <div>
                <div>{ `Active port: ${connectionStore.activePortName}` }</div>
            </div>
        )
    }
}


export default observer(Workspace);

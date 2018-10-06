import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components'
import grblStore from '../../stores/grblStore';

@observer
class StatusBar extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className={ this.props.className }>
                <div>
                    <div>WPos</div>
                    <div>X <span>{ grblStore.WPos.x }</span></div>
                    <div>Y <span>{ grblStore.WPos.y }</span></div>
                    <div>Z <span>{ grblStore.WPos.z }</span></div>
                </div>
                <div>
                    <div>MPos</div>
                    <div>X <span>{ grblStore.MPos.x }</span></div>
                    <div>Y <span>{ grblStore.MPos.y }</span></div>
                    <div>Z <span>{ grblStore.MPos.z }</span></div>
                </div>

            </div>
        )
    }
}

StatusBar = styled(StatusBar)`
    flex-basis: 75px;
    flex-shrink: 0;
    flex-grow: 0;
`;

export default StatusBar;
import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components'
import grblStore from '../../stores/grblStore';
import gcodeStore from '../../stores/gcodeStore';
import renderStore from '../../stores/renderStore';

@observer
class StatusBar extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className={ this.props.className }>
                <div>
                    <div>MPos</div>
                    <div>X <span>{ grblStore.MPos.x }</span></div>
                    <div>Y <span>{ grblStore.MPos.y }</span></div>
                    <div>Z <span>{ grblStore.MPos.z }</span></div>
                </div>
                <div>
                    <div>WPos</div>
                    <div>X <span>{ grblStore.WPos.x }</span> <span onClick={ () => grblStore.zeroX() }>Zero</span></div>
                    <div>Y <span>{ grblStore.WPos.y }</span> <span onClick={ () => grblStore.zeroY() }>Zero</span></div>
                    <div>Z <span>{ grblStore.WPos.z }</span> <span onClick={ () => grblStore.zeroZ() }>Zero</span></div>
                </div>
                <div>
                    <div>Machine state</div>
                    <div> { grblStore.machineState.toString() }</div>
                </div>
                <div>
                    <div onClick={ () => grblStore.run() }>Run program</div>
                    <div onClick={ () => grblStore.pause() }>Pause program</div>
                    <div onClick={ () => grblStore.resume() }>Resume program</div>
                    <div onClick={ () => grblStore.stop() }>STOP program</div>
                </div>
                <div>
                    <div>Mouse pos</div>
                    <div>X <span>{ renderStore.mouseWorldX }</span></div>
                    <div>Y <span>{ renderStore.mouseWorldY }</span></div>
                    <div>Z <span>-</span></div>
                </div>
            </div>
        )
    }
}

StatusBar = styled(StatusBar)`
    flex-basis: 75px;
    flex-shrink: 0;
    flex-grow: 0;
    display: flex;
`;

export default StatusBar;
import React, { Component } from 'react';
import {observer} from 'mobx-react';
import styled from 'styled-components';
import connectionStore from '../../stores/connectionStore';
import autoBind from 'auto-bind';

const SerialNotAvailable = styled((props) => (
    <div>Serialport module is not available</div>
));

@observer
class PortSelectView extends React.Component {
    render() {
        let ports = null;
        console.log("Render ports", connectionStore.ports);
        if (connectionStore.ports) {
            ports = connectionStore.ports.map((port) => (
                <div onClick={() => connectionStore.open(port.comName)}>{port.comName}</div>
            ));
        }
        return (
            <div>
                <div>Hello from serial connection tab</div>
                <div>{connectionStore.portInfo}</div>
                {ports}
                <button onClick={() => connectionStore.refreshPorts()}>Refresh</button>
            </div>
        )
    }
};

@observer
class ScrollingHistoryView extends React.Component {
    componentDidUpdate() {
        if (this.ref) {
            this.ref.scrollTop = this.ref.scrollHeight;
        }
    }

    render() {
        const history = connectionStore.history.map((line) => (
            <div>{line}</div>
        ));
        return (
            <div className={ this.props.className } ref={ (r) => this.ref = r }>
                { history }
            </div>
        )
    }
}

ScrollingHistoryView = styled(ScrollingHistoryView)`
  overflow-y: auto;
  overflow-x: hidden;
  flex-grow: 1;
`;

const CloseButton = styled((props) => (
    <button
        onClick={ props.onClick }
        className={ props.className }>{ props.children }</button>))`
  flex-shrink: 0;
`;

@observer
class TerminalView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: ""
        };
        this.ref = null;
        autoBind(this);
    }
    disconnect() {
        connectionStore.close();
    }
    handleInputChange(e) {
        console.log("Change", e.key);
        this.setState({inputValue: e.target.value});
    }
    handleInputKeypress(e) {
        if (e.key === "Enter") {
            connectionStore.writeln(this.state.inputValue);
            e.preventDefault();
            e.stopPropagation();
            this.setState({inputValue: ""});
        }
    }

    render() {

        return (
            <div className={ this.props.className }>
                <CloseButton onClick={ () => this.disconnect()}>Close port</CloseButton>
                <ScrollingHistoryView/>
                <input
                    value={ this.state.inputValue }
                    onChange={ (e) => this.handleInputChange(e) }
                    onKeyPress={ (e) => this.handleInputKeypress(e) }/>
            </div>
        );
    }
}
TerminalView = styled(TerminalView)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

class SerialConnectionTab extends React.Component {
    render() {
        if (connectionStore.port) {
            return <TerminalView/>
        } else if (connectionStore.serialport) {
            return <PortSelectView/>
        } else {
            return <SerialConnectionTab/>
        }
    }
}

export default observer(SerialConnectionTab);

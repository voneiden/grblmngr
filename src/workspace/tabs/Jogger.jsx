import React, { Component } from 'react';
import {observer} from 'mobx-react';
import styled from 'styled-components';
import jogStore from '../../stores/jogStore';
import autoBind from 'auto-bind';


@observer
class Jogger extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }
    render() {
        return (
            <div className={this.props.className}>
                <div>
                    <div onClick={ () => jogStore.jog(-1, 1) }>\</div>
                    <div onClick={ () => jogStore.jog(0, 1) }>|</div>
                    <div onClick={ () => jogStore.jog(1, 1) }>/</div>
                </div>
                <div>
                    <div onClick={ () => jogStore.jog(-1,  0) }>--</div>
                    <div onClick={ () => jogStore.stopJog() }>X</div>
                    <div onClick={ () => jogStore.jog(1,  0) }>--</div>
                </div>
                <div>
                    <div onClick={ () => jogStore.jog(-1, -1) }>/</div>
                    <div onClick={ () => jogStore.jog(0, -1) }>|</div>
                    <div onClick={ () => jogStore.jog(1, -1) }>\</div>
                </div>
            </div>
        );
    }
};

Jogger = styled(Jogger)`
  display: flex;
  flex-direction: column;
  > div {
    display: flex;
    > div {
      border: 1px solid black;
      width: 50px;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
  }
`;

export default Jogger;

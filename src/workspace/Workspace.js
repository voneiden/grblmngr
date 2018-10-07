import React, { Component } from 'react';
import styled from 'styled-components'
import {observable, action, computed} from "mobx";
import {observer} from 'mobx-react';
import connectionStore from '../stores/connectionStore';
import SerialConnectionTab from './tabs/SerialConnectionTab';
import Renderer from './renderer/Renderer';
import StatusTab from './tabs/StatusTab';
import StatusBar from './status/StatusBar';
import Editor from './tabs/Editor';

class TabStore {
    @observable
    _selectedTab = null;


    tabs = {
        'Serial': <SerialConnectionTab/>,
        'File': <Editor/>,
        'Autolevel': null,
    };

    @computed
    get selectedTabName() {
        if (!this._selectedTab) {
            return Object.keys(this.tabs)[0];
        }
        return this._selectedTab;
    }

    @action
    selectTab(tab) {
        console.log("Select tab", tab);
        this._selectedTab = tab;
    }
}

const tabStore = new TabStore();

const TabItem = styled(observer((props) => (
    <div
        className={ props.className }
        onClick={ () => tabStore.selectTab(props.name) }
    >
        { props.name }
    </div>)))`
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 1px;
  text-align: center;
  :not(:last-child) {
    border-right: 1px solid black;
  }
  background-color: ${ props => props.selected ? "red" : "blue" }
  
`;

const TabRow = styled((props) => (<div className={ props.className }>{ props.children }</div>))`
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid black;
  flex-shrink: 0;
`;

const SideTopContainer = styled(observer((props) => (
    <div className={ props.className }>
        <TabRow>
            { Object.keys(tabStore.tabs).map((tab, i) => <TabItem key={i} name={ tab } selected={ tabStore.selectedTabName === tab} /> )}
        </TabRow>
        { tabStore.tabs[tabStore.selectedTabName] }
    </div>
)))`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
`;


const SideBottomContainer = styled((props) => (
    <div className={ props.className }>
        Bjottom container
    </div>
))`
    flex-grow: 0;
    flex-shrink: 0;
    background-color: magenta;
    height: 400px;
`;

const SidePanel = styled((props) => (
    <div className={ props.className }>
        <SideTopContainer/>
        <SideBottomContainer/>
    </div>
))`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  width: 400px;
  
`;


const MainPanel = styled((props) => (
    <div className={ props.className }>
        <StatusBar/>
        <Renderer/>
    </div>
))`
  background-color: lime;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;


class BaseWorkspace extends React.Component {
    componentWillMount() {
        window.onbeforeunload = () => connectionStore.close();
    }
    componentWillUnmount() {
        console.warn("Will unmount");
    }
    render() {
        return (
            <div className={ this.props.className }>
                <SidePanel/>
                <MainPanel/>
            </div>
        );
    }
}

const Workspace = styled(BaseWorkspace)`
  display: flex;
  width: 100%;
  height: 100%;
`;


export default Workspace;

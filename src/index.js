import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Workspace from './workspace/Workspace';
//import loadAdd from './assembly/src/lib.rs';
//console.log("LOAD ADD", loadAdd);
window.startuptime = Date.now();
ReactDOM.render(<Workspace />, document.getElementById('root'));

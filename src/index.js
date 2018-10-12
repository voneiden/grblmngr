import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Workspace from './workspace/Workspace';
//import loadAdd from './assembly/src/lib.rs';
import './util/thinplates';
window.startuptime = Date.now();
ReactDOM.render(<Workspace />, document.getElementById('root'));

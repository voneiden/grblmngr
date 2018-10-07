import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Workspace from './workspace/Workspace';
window.startuptime = Date.now();
ReactDOM.render(<Workspace />, document.getElementById('root'));

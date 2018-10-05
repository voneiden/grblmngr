import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Workspace from './workspace/Workspace';
import registerServiceWorker from './registerServiceWorker';
window.startuptime = performance.now();
ReactDOM.render(<Workspace />, document.getElementById('root'));
registerServiceWorker();
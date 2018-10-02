import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Workspace from './workspace/Workspace';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Workspace />, document.getElementById('root'));
registerServiceWorker();

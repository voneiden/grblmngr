/**
 GrblMgmr is a frontend application to interface with Grbl via GrblMQTT
 Copyright (C) 2016 Matti Eiden

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import classnames from 'classnames';
import ControlView from './../views/ControlView';
import EditorView from './../views/EditorView';

export default class Workspace extends React.Component {
    constructor(props) {
        super(props);
        console.log("props", props);
        this.state = {
            //views: props.views.map((ViewComponent, i) => <ViewComponent key={i}/>)
        };
        console.log("state", this.state.views);




    }




    render() {
        return (
            <div>
                <ControlView grblStatus={this.props.grblStatus}/>
                <EditorView />
            </div>
        );
    }
}
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
import ViewContainer from './ViewContainer';
import ControlView from './../views/ControlView';
import EditorView from './../views/EditorView';

/**
 * Every ViewContainer has a deterministic "path" id that allows the workspace to modify it's workspace state
 * root/0/0/1
 */

export default class Workspace extends React.Component {
    constructor(props) {
        super(props);
        console.log("props", props);
        this.state = {
            space: {
                content: [
                    {
                        content: [
                            {
                                content: "ControlView"
                            },
                            {
                                content: "RenderView"
                            }
                        ],
                        horizontal: false
                    },
                    {
                        content:  "EditorView"
                    }
                ],
                horizontal: true,
                scale: 1.0
            },
            editing: true
        };
        console.log("state", this.state.views);
    }


    destroyViewContainer(path) {
        let parent = this.state.space;
        let target = this.state.space;

        let keys = path.split("/");
        for (let i=0; i < keys.length; i++) {
            let key = keys[i];
            if (key == "root") {
                continue;
            }

            //parent = target;
            //target = parent[

        }
    }

    splitViewContainer(path, horizontal=false) {

    }

    shouldComponentUpdate(nextProps, nextState) {
        return  JSON.stringify(nextProps) != JSON.stringify(this.props)
                || JSON.stringify(nextState) != JSON.stringify(this.state);
    }



    render() {
        let test = {
            foo: <EditorView/>
        };
        /*
        <ControlView grblStatus={this.props.grblStatus}/>
                <EditorView />
         */
        console.log("Test", test);
        return (
            <div className={ classnames({
                "workspace": true,
                "workspace-editing": this.state.editing,
                "flex": true,
                "flex-grow": true
            })}>
                <ViewContainer content={this.state.space} grblState={ this.props.grblState } path="root"/>
            </div>
        );
    }
}
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
import ViewView from '../views/ViewView';

import ControlView from '../views/ControlView';
import EditorView from '../views/EditorView';
import RenderView from '../views/RenderView';

const viewMap = {
    "ControlView": ControlView,
    "EditorView": EditorView,
    "RenderView": RenderView
};

export default class ViewContainer extends React.Component {
    constructor(props) {
        super(props);

        this.scaleStyle = this.scaleStyle.bind(this);

    }

    scaleStyle() {
        if (this.props.content.scale) {
            return {"flexGrow": this.props.content.scale}
        }
        return null;
    }


    render() {
        let self = this.props.content;
        let content;
        //console.log("This props content", this.props.content);
        if (self.content === null) {
            content = <ViewView/>;
        }
        else if (Array.isArray(self.content)) {
            if (self.content.length === 2) {

                content = [
                        <ViewContainer content={ self.content[0] } grblState={ this.props.grblState }
                                       style={ this.scaleStyle() }
                                       path={ this.props.path + "/0" }
                        />,
                        <ViewContainer content={ self.content[1] } grblState={ this.props.grblState }
                                       path={ this.props.path + "/1" }
                        />
                    ];
            }
        }
        else {
            if (viewMap[self.content]) {
                let ContentView = viewMap[self.content];
                content = (
                    <ContentView grblState={ this.props.grblState }/>
                );
            }
            else {
                console.log("SELF", self);
                content = <div>Unknown view</div>;
            }
        }

        //console.log("Our content is", content);
        return (
            <div className={classnames({
                "view-container": true,
                "flex-grow": true,
                "flex": true,
                "flex-column": !self.horizontal,
                "flex-row": self.horizontal
            })} style={this.props.style}>{ content }</div>
        );
    }
}
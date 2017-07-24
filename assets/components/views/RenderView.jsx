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

// Render view uses three.js to produce 2d/3d representation of the machine state and loaded toolpath
import React from 'react';
import Plotly from 'plotly.js';


export default class RenderView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.refRoot;
        this.plotMounted = false;

        this.refRootCallback = this.refRootCallback.bind(this);
    }

    componentDidMount() {
        var trace1 = {
            x: [1,2,3,4,5],
            y: [4,2,6,3,5],
            z: [0,0,1,1,10],
            mode: 'lines',
            marker: {
                color: '#1f77b4',
                size: 12,
                symbol: 'circle',
                line: {
                    color: 'rgb(0,0,0)',
                    width: 0
                }},
            line: {
                color: '#1f77b4',
                width: 1
            },
            type: 'scatter3d'
        };
        var trace2 = {
            x: [0],
            y: [0],
            z: [0],
            mode: 'markers',
            marker: {
                color: '#1f77b4',
                size: 12,
                symbol: 'circle',
                line: {
                    color: 'rgb(0,0,0)',
                    width: 0
                }
            },
            type: "scatter3d"
        };
        var data = [trace1, trace2];
        var layout = {
            title: '3D Line Plot',
            autosize: true,
            margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 65
            }
        };
        this.refPlot = Plotly.newPlot(this.refRoot, data, layout);
        this.plotMounted = true
    }

    componentDidUpdate() {
        console.log(this.props.grblState);
        if (this.refRoot && this.plotMounted) {
            console.log(this.refRoot, this.plotMounted);
            let pos = this.props.grblState.MPos;

            var update = {x: [pos[0]], y: [pos[1]], z: [pos[2]]};
            try {
                Plotly.restyle(this.refRoot, update, [2])
            } catch (e) {
                console.log("Woops");
            }
        }
    }


    refRootCallback(ref) {
        this.refRoot = ref;
    }

    render() {

        if (this.refRoot) {
            console.log("Resize!");
            Plotly.Plots.resize(this.refRoot);
        }
        return (
            <div ref={ this.refRootCallback } className="flex-grow">Render view!</div>
        );
    }
}
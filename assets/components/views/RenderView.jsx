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
import ReactDOM from 'react-dom';
import * as Three from 'three';
import autoBind from 'react-autobind';

function cube( size ) {
    var h = size * 0.5;
    var geometry = new Three.Geometry();
    geometry.vertices.push(
        new Three.Vector3( -h, -h, -h ),
        new Three.Vector3( -h, h, -h ),
        new Three.Vector3( -h, h, -h ),
        new Three.Vector3( h, h, -h ),
        new Three.Vector3( h, h, -h ),
        new Three.Vector3( h, -h, -h ),
        new Three.Vector3( h, -h, -h ),
        new Three.Vector3( -h, -h, -h ),
        new Three.Vector3( -h, -h, h ),
        new Three.Vector3( -h, h, h ),
        new Three.Vector3( -h, h, h ),
        new Three.Vector3( h, h, h ),
        new Three.Vector3( h, h, h ),
        new Three.Vector3( h, -h, h ),
        new Three.Vector3( h, -h, h ),
        new Three.Vector3( -h, -h, h ),
        new Three.Vector3( -h, -h, -h ),
        new Three.Vector3( -h, -h, h ),
        new Three.Vector3( -h, h, -h ),
        new Three.Vector3( -h, h, h ),
        new Three.Vector3( h, h, -h ),
        new Three.Vector3( h, h, h ),
        new Three.Vector3( h, -h, -h ),
        new Three.Vector3( h, -h, h )
    );
    return geometry;
}

export default class RenderView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        autoBind(this);
        this._zoom = null;
        this._canvas = null;
        this._scene = null;
        this._camera = null;
        this._renderer = null;
    }

    setRendererSize() {
        let node = ReactDOM.findDOMNode(this);
        if (this._renderer) {
            this._renderer.setSize(node.clientWidth, node.clientHeight);
        }
    }

    setOrthographiCameraSize() {
        let node = ReactDOM.findDOMNode(this);
        let aspectRatio = node.clientWidth / node.clientHeight;
        this._camera.left = this._zoom / -2;
        this._camera.right = this._zoom / 2;
        this._camera.top = this._zoom / aspectRatio / -2;
        this._camera.bottom = this._zoom / aspectRatio / 2;
        console.log(this._camera.left, this._camera.right, this._camera.top, this._camera.bottom);
        this._camera.updateProjectionMatrix();
    }

    componentDidMount() {
        let node = ReactDOM.findDOMNode(this);

        this._renderer = new Three.WebGLRenderer({canvas: this._canvas});
        this.setRendererSize();

        this._scene = new Three.Scene();

        this._zoom = 1000;
        this._camera = new Three.OrthographicCamera(-100,100,100,-100);
        this._camera.position.z = 150;
        this.setOrthographiCameraSize();
        this._scene.add(this._camera);

        let geometryCube = cube( 50 );
        geometryCube.computeLineDistances();
        let object = new Three.LineSegments( geometryCube, new Three.LineDashedMaterial( { color: 0xffaa00, dashSize: 3, gapSize: 1, linewidth: 2 } ) );
        this._scene.add( object );

        window.addEventListener("resize", this.onWindowResize);
        this._renderer.setPixelRatio( window.devicePixelRatio );
        this._renderer.render(this._scene, this._camera);

    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.onWindowResize)
    }

    onWindowResize() {
        this.setRendererSize();
        this.setOrthographiCameraSize();
        this._renderer.render(this._scene, this._camera);
    }

    componentDidUpdate() {
        if (this.refRoot && this.plotMounted) {
            console.log(this.refRoot, this.plotMounted);
            let pos = this.props.grblState.MPos;

            var update = {x: [pos[0]], y: [pos[1]], z: [pos[2]]};
            try {
                //Plotly.restyle(this.refRoot, update, [2])
            } catch (e) {
                console.log("Woops");
            }
        }
    }


    refRootCallback(ref) {
        this.refRoot = ref;
    }

    render() {
        return (
            <div ref={ this.refRootCallback } className="flex-grow render-view">
                <canvas ref={(r) => this._canvas = r}/>
            </div>
        );
    }
}
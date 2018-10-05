import React, { Component } from 'react';
import * as THREE from 'three';
import styled from 'styled-components'
import {observable, action, computed} from "mobx";
import {observer} from 'mobx-react';
import gcodeStore from '../../stores/gcodeStore';
import {p, Motion} from '../../stores/gcodeStore';
import autoBind from 'auto-bind';

class RenderStore {
    @observable lineToGeometryMap = observable.map();
    @observable GeometryToLineMap = observable.map();

    solidMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    dashedMaterial = new THREE.LineDashedMaterial( { color: 0xffff00,  dashSize: 1, gapSize: 0.5 });

    scene = new THREE.Scene();

    get lastPosition() {
        if (this.scene.children.length) {
            let lastChild = this.scene.children[this.scene.children.length - 1];
            return lastChild.geometry.vertices[lastChild.geometry.vertices.length - 1];
        } else {
            return new THREE.Vector3(0, 0, 0);
        }
    }

    createMoveSegment(actions, material=null) {
        let segmentGeometry = new THREE.Geometry();
        let last = this.lastPosition;
        segmentGeometry.vertices.push(last);
        last = { // TODO just use lowercase coords when converting gcode..
            X: last.x,
            Y: last.y,
            Z: last.z
        };
        for (let action of actions) {
            if (action.X !== last.X || action.Y !== last.Y || action.Z !== last.Z) {
                segmentGeometry.vertices.push(new THREE.Vector3(action.X, action.Y, action.Z));
            }
            last = action;
        }
        let line = new THREE.Line( segmentGeometry, material ? material : this.solidMaterial );
        line.computeLineDistances();
        this.scene.add(line);
    }
    createArcSegment(actions) {
        for (let action of actions) {
            let curve = new THREE.Curve();
            let center = new THREE.Vector3(action.arc.cx, action.arc.cy, action.arc.cz);
            let start = new THREE.Vector3(action.arc.sx, action.arc.sy, action.arc.sz);
            let end = new THREE.Vector3(action.X, action.Y, action.Z);
            start.sub(center);
            end.sub(center);

            let angle = Math.abs(start.angleTo(end));

            /** Full circle */
            if (angle === 0) {
                angle = 2 * Math.PI;
            }

            /** For XY plane, the Z must be
             * negative for CW motion
             * positive for CCW motion
             */
            let N = start.clone().cross(end).normalize();
            if (action.arc.cw) {
                if (N.z > 0) {
                    N.negate();
                    angle = 2 * Math.PI - angle;
                }
            } else if (N.z < 0) {
                N.negate();
                angle = 2 * Math.PI - angle;
            }

            curve.getPoint = (t) => {
                let point = start.clone();
                //console.log("Start", start);
                point.applyAxisAngle(N, angle * t);
                //console.log("Point", t, point);
                point.add(center);
                return point;
            };

            let lineGeometry = new THREE.Geometry();
            lineGeometry.vertices = curve.getPoints(10);
            let line = new THREE.Line(lineGeometry, this.solidMaterial);
            line.computeLineDistances();
            this.scene.add(line);
        }
    }
    createRapidSegment(actions) {
        this.createMoveSegment(actions, this.dashedMaterial);
    }

    createMotionSegment(motion, actions) {
        if (motion === Motion.MOVE) { this.createMoveSegment(actions); }
        else if (motion === Motion.RAPID) { this.createRapidSegment(actions); }
        else if (motion === Motion.CW_ARC || motion === Motion.CCW_ARC) { this.createArcSegment(actions); }
    }
}
const renderStore = new RenderStore();

class Renderer extends React.Component {
    constructor(props) {
        super(props);
        this.container = null;
        this.canvas = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.handleResize = this.handleResize.bind(this);
    }

    handleResize() {
        if (this.container && this.renderer) {
            let width = this.container.offsetWidth;
            let height = this.container.offsetHeight;
            this.renderer.setSize(width, height);
            this.camera.aspect = width/height;
            this.camera.updateProjectionMatrix();
            this.renderer.render( renderStore.scene, this.camera );
        }
    }

    componentDidMount() {
        this.camera = new THREE.PerspectiveCamera( 75, this.canvas.offsetWidth / this.canvas.offsetHeight, 0.1, 1000 );
        const ratio = this.canvas.offsetWidth / this.canvas.offsetHeight;
        this.camera = new THREE.OrthographicCamera( -100 * ratio, 100*ratio, 100, -100, 1, 1000 );
        this.camera.zoom = 3;
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
        this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
        let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        let last = {};
        console.log("P actions", p.actions);

        let segmentActions = [];
        let previousMotion = null;
        for (let action of p.actions) {
            if (action.motion !== previousMotion) {
                renderStore.createMotionSegment(previousMotion, segmentActions);
                previousMotion = action.motion;
                segmentActions = [];
            }
            segmentActions.push(action);
        }
        renderStore.createMotionSegment(previousMotion, segmentActions);

        this.camera.position.z = 30;
        this.handleResize();
        console.log("Startup completed in ", performance.now()- window.startuptime, "ms");
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }
    render() {
        return (
            <div className={ this.props.className } ref={(r) => this.container = r }>
                <canvas ref={(r) => this.canvas = r}/>
            </div>
        )
    }
}

const StyledRenderer = styled(Renderer)`
  flex-grow: 1;
  flex-shrink: 1;
  background-color: aquamarine;
  position: relative;
  canvas {
    position: absolute;
  }
`;

export default StyledRenderer;

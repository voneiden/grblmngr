import React, { Component } from 'react';
import * as THREE from 'three';
import styled from 'styled-components'
import {observable, action, computed} from "mobx";
import {observer} from 'mobx-react';
import gcodeStore from '../../stores/gcodeStore';
import {p, Motion} from '../../stores/gcodeStore';

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
            this.renderer.render( this.scene, this.camera );
        }
    }

    componentDidMount() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, this.canvas.offsetWidth / this.canvas.offsetHeight, 0.1, 1000 );
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
        this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
        let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        let geometry = new THREE.Geometry();
        let last = {};
        console.log("P actions", p.actions);
        for (let action of p.actions) {
            if (action.X !== last.X || action.Y !== last.Y || action.Z !== last.Z) {
                console.log("Push", action.X, action.Y, action.Z);
                geometry.vertices.push(new THREE.Vector3( action.X, action.Y, action.Z) );
            }
            if (action.motion === Motion.CW_ARC || action.motion === Motion.CCW_ARC) {
                if (action.X !== last.X || action.Y !== last.Y || action.Z !== last.Z) {
                    let curve = new THREE.Curve();
                    console.log("ACTION ARC", action.arc);
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
                    console.log("N is", N, "and arc is clockwise?", action.arc.cw);
                    if (action.arc.cw) {
                        if (N.z > 0) {
                            N.negate();
                            angle = 2 * Math.PI - angle;
                        }
                    } else if (N.z < 0) {
                        N.negate();
                        angle = 2 * Math.PI - angle;
                    }
                    console.log("N axis", N);


                    console.log("Use angle..", angle);
                    curve.getPoint = (t) => {
                        let point = start.clone();
                        //console.log("Start", start);
                        point.applyAxisAngle(N, angle * t);
                        //console.log("Point", t, point);
                        point.add(center);
                        return point;
                    };

                    let lineGeometry = new THREE.Geometry();
                    lineGeometry.vertices = curve.getPoints(100);
                    let line = new THREE.Line(lineGeometry, material);
                    line.computeLineDistances();
                    this.scene.add(line);
                }
            }
            last = action;
        }
        let line = new THREE.Line( geometry, material );
        this.scene.add(line);

        this.camera.position.z = 30;
        this.handleResize();

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

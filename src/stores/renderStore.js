import {autorun, observable, action} from "mobx";
import * as THREE from "three";
import grblStore from "./grblStore";
import gcodeStore, {Motion} from "./gcodeStore";
import autoBind from "auto-bind";

class RenderStore {
    @observable lineToGeometryMap = observable.map();
    @observable GeometryToLineMap = observable.map();
    @observable zoom = 20;

    @observable mouseWorldX = 0;
    @observable mouseWorldY = 0;

    lastWPosTarget = {
        x: grblStore.WPos.x,
        y: grblStore.WPos.y,
        z: grblStore.WPos.z
    };
    lastWPosSource = {
        x: grblStore.WPos.x,
        y: grblStore.WPos.y,
        z: grblStore.WPos.z
    };

    majorGridMaterial = new THREE.MeshBasicMaterial( { color: 0x003300, depthTest: false });
    minorGridMaterial = new THREE.MeshBasicMaterial( { color: 0x001100, depthTest: false });
    solidMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    dashedMaterial = new THREE.LineDashedMaterial( { color: 0xffff00,  dashSize: 1, gapSize: 0.5 });
    millMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, depthTest: false });

    renderer = null;
    camera = null;
    scene = new THREE.Scene();

    grid = new THREE.Group();

    mill = new THREE.Group();
    millRunner = null;

    program = new THREE.Group();
    programRunner = null;

    animationRunner = null;
    animationStart = null;


    constructor() {
        // TODO do multiple scenes, and call renderer.clearDepth() to make stuff come out in correct order
        // minor grid
        // major grid
        // mill
        // gcode

        this.mill.add(this.drawLine(-1, 0, 1, 0, 10, this.millMaterial, 1));
        this.mill.add(this.drawLine(0, -1, 0, 1, 10, this.millMaterial, 1));

        this.scene.add(this.mill);
        this.scene.add(this.program);

        /**
        this.millRunner = autorun(() => {
            this.mill.position.set(grblStore.WPos.x, grblStore.WPos.y, grblStore.WPos.z);
            this.doRender();
        });
         */

        this.programRunner = autorun(() => {
            const program = gcodeStore.program;
            // Dumb cleanup
            for (let i = this.program.children.length - 1; i >= 0; i--) {
                let child = this.program.children[i];
                this.program.remove(child);
            }
            if (program) {
                let segmentActions = [];
                let previousMotion = null;
                const actions = program.actions;
                for (let action of actions) {
                    if (action.motion !== previousMotion) {
                        this.createMotionSegment(previousMotion, segmentActions);
                        previousMotion = action.motion;
                        segmentActions = [];
                    }
                    segmentActions.push(action);
                }
                this.createMotionSegment(previousMotion, segmentActions);

            }
        });

        this.animationRunner = autorun(() => {
            if (grblStore.WPos.x !== this.lastWPosTarget.x ||
                grblStore.WPos.y !== this.lastWPosTarget.y ||
                grblStore.WPos.z !== this.lastWPosTarget.z) {
                this.lastWPosSource.x = parseFloat(this.lastWPosTarget.x);
                this.lastWPosSource.y = parseFloat(this.lastWPosTarget.y);
                this.lastWPosSource.z = parseFloat(this.lastWPosTarget.z);
                this.lastWPosTarget.x = grblStore.WPos.x;
                this.lastWPosTarget.y = grblStore.WPos.y;
                this.lastWPosTarget.z = grblStore.WPos.z;
                this.animationStart = performance.now();
                window.requestAnimationFrame((timestamp) => this.doAnimate(timestamp));
            }
            this.doRender();
        });

        autoBind(this);
    }

    doAnimate(timestamp) {
        const delta = timestamp - this.animationStart;
        const fraction = delta / 200;
        if (fraction > 1) {
            return;
        }
        const tx = parseFloat(this.lastWPosTarget.x);
        const ty = parseFloat(this.lastWPosTarget.y);
        const tz = parseFloat(this.lastWPosTarget.z);
        const x = this.lastWPosSource.x + (tx - this.lastWPosSource.x) * fraction;
        const y = this.lastWPosSource.y + (ty - this.lastWPosSource.y) * fraction;
        const z = this.lastWPosSource.z + (tz - this.lastWPosSource.z) * fraction;
        this.mill.position.set(x, y, z);
        this.doRender();
        window.requestAnimationFrame((timestamp) => this.doAnimate(timestamp));
    }

    doRender() {
        if (this.renderer) {
            this.renderer.render( this.scene, this.camera );
        }
    }

    drawLine(c11, c12, c21, c22, depth, material, renderOrder=0) { // TODO plane support
        let lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(new THREE.Vector3(c11, c12, depth));
        lineGeometry.vertices.push(new THREE.Vector3(c21, c22, depth));
        let line = new THREE.Line(lineGeometry, material);
        line.renderOrder = renderOrder;
        line.computeLineDistances();

        return line;
    }

    createGrid(left, right, top, bottom) {
        if (this.gridScene) {
            this.scene.remove(this.gridScene);
        }
        this.gridScene = new THREE.Scene();
        // Metric grid as an exercise, only XY-plane
        // Major tick every 10 mm
        // Minor tick every 1 mm
        const zoom = this.zoom;
        let major = 10;
        let minor = 1;

        let widthStart = Math.floor(Math.floor(left/major/zoom) * major);
        let widthEnd = Math.ceil(Math.ceil(right/major/zoom) * major);
        let heightStart = Math.floor(Math.floor(bottom/major/zoom) * major);
        let heightEnd = Math.ceil(Math.ceil(top/major/zoom) * major);
        for (let w=widthStart; w <= widthEnd;  w += major) {
            const max = Math.min(w + major, widthEnd);
            for (let wm=w + minor; wm < max; wm += minor) {
                this.gridScene.add(this.drawLine(wm, heightStart, wm, heightEnd, 0, this.minorGridMaterial, -2));
            }
            this.gridScene.add(this.drawLine(w, heightStart, w, heightEnd, 0, this.majorGridMaterial, -1));
        }
        for (let h=heightStart; h <= heightEnd; h+= major) {
            for (let hm=h + minor; hm < h + major && h < heightEnd; hm += minor) {
                this.gridScene.add(this.drawLine(widthStart, hm, widthEnd, hm, 0, this.minorGridMaterial, -2));
            }
            this.gridScene.add(this.drawLine(widthStart, h, widthEnd, h, 0, this.majorGridMaterial, -1));
        }
        this.scene.add(this.gridScene);
    }


    get lastPosition() {
        if (this.program.children.length) {
            let lastChild = this.program.children[this.program.children.length - 1];
            if (lastChild.geometry) {
                return lastChild.geometry.vertices[lastChild.geometry.vertices.length - 1];
            }
        }
        return new THREE.Vector3(0, 0, 0);
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
        this.program.add(line);
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
            console.log("Angle", angle);
            /** Full circle */
            if (angle === 0) {
                angle = 2 * Math.PI;
            }

            /** For XY plane, the Z must be
             * negative for CW motion
             * positive for CCW motion
             */
            let N = start.clone().cross(end).normalize();
            if (N.length() === 0) { // TODO handle different planes
                if (action.arc.cw) {
                    N.z = -1;
                } else {
                    N.z = 1;
                }
            }
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
            this.program.add(line);
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

    @action
    setMouseWorldPosition(mouseX, mouseY) {
        this.mouseWorldX = mouseX.toFixed(3);
        this.mouseWorldY = mouseY.toFixed(3);
    }

    @action
    zoomIn() {
        this.camera.zoom *= 1.1;
        console.log(this.camera.zoom);
        this.camera.updateProjectionMatrix();
        this.doRender();
    }

    @action
    zoomOut() {
        this.camera.zoom /= 1.1;
        this.camera.updateProjectionMatrix();
        this.doRender();
    }
}
const renderStore = new RenderStore();
export default renderStore;
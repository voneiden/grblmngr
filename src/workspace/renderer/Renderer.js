import React, { Component } from 'react';
import * as THREE from 'three';
import styled from 'styled-components'
import renderStore from '../../stores/renderStore';
import autoBind from 'auto-bind';

class Renderer extends React.Component {
    constructor(props) {
        super(props);
        this.container = null;
        this.canvas = null;
        this.panning = false;
        autoBind(this);
    }

    handleResize() {
        if (this.container && renderStore.renderer) {
            const width = this.container.offsetWidth;
            const height = this.container.offsetHeight;
            renderStore.renderer.setSize(width, height);
            renderStore.camera.left = -width;
            renderStore.camera.right = width;
            renderStore.camera.top = height;
            renderStore.camera.bottom = -height;
            renderStore.createGrid(-width, width, height, -height);
            renderStore.camera.updateProjectionMatrix();
            renderStore.renderer.render( renderStore.scene, renderStore.camera );
        }
    }

    handleMouseDown(e) {
        if (e.button === 1) {
            this.panning = true;
        }
    }
    handleMouseMove(e) {
        if (this.panning) {
            let dx = e.clientX - this.mouseX;
            let dy = e.clientY - this.mouseY;
            let pos = renderStore.camera.position;
            pos.setX(pos.x - dx / 5); // Todo appropriate factor based on zoom
            pos.setY(pos.y + dy / 5);
            renderStore.doRender();
        }
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        if (this.container) {
            let bounds = this.container.getBoundingClientRect();
            const canvasX = this.mouseX - bounds.left;
            const canvasY = this.mouseY - bounds.top;
            const centerX = canvasX - (bounds.width / 2);
            const centerY = (bounds.height / 2) - canvasY;
            const worldX = centerX / (renderStore.camera.zoom / 2) + renderStore.camera.position.x;
            const worldY = centerY / (renderStore.camera.zoom / 2) + renderStore.camera.position.y;
            renderStore.setMouseWorldPosition(worldX, worldY);
        }
    }
    handleMouseUp(e) {
        if (e.button === 1) {
            this.panning = false;
        }
    }

    componentDidMount() {
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;
        // TODO select z, near and far with some logic depending on the gcode
        renderStore.camera = new THREE.OrthographicCamera( -width, width, height, -height, 0, 1000 );
        renderStore.camera.position.z = 100;
        renderStore.camera.zoom = 40;
        renderStore.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
        renderStore.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
        this.handleResize();
        console.log("Startup completed in ", Date.now()- window.startuptime, "ms");
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('mouseup', this.handleMouseUp);

    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }
    render() {
        return (
            <div
                className={ this.props.className }
                ref={(r) => this.container = r }
                onMouseDown={ (e) => this.handleMouseDown(e) }
                onMouseMove={ (e) => this.handleMouseMove(e) }>
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

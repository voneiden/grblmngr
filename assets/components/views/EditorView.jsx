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

// Editor view uses ace to provide a gcode editor

import React from 'react';
import { render } from 'react-dom';
import brace from 'brace';
import AceEditor from 'react-ace';
import Button from 'muicss/lib/react/button';
import 'brace/mode/gcode';
import 'brace/theme/github';

import gcode from 'gcode';

import MqttClient from '../../utils/MqttClient';
import GrblSender from '../../utils/GrblSender';

export default class EditorView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            running: false
        };


        this.editorCode = "";
        this.runBuffer = [];

        this.onChange = this.onChange.bind(this);
        this.doParse = this.doParse.bind(this);

        this.startRun = this.startRun.bind(this);
        this.doRun = this.doRun.bind(this);
        this.stopRun = this.stopRun.bind(this);

        this.refAceEditorCallback = this.refAceEditorCallback.bind(this);
    }

    onChange(newValue) {
        console.log('change', newValue);
        this.editorCode = newValue;
    }

    doParse() {
        console.log("Parse..", this.editorCode);
        gcode.parseString(this.editorCode, function (error, result) {
            console.log(result);
        });
    }

    startRun() {
        console.log("Running");
        // Disable editor etc etc
        this.runBuffer = this.editorCode.split(/\r\n|\r|\n/);
        console.log("Run buffer", this.runBuffer);
        this.setState({
            running: true
        }, this.doRun);
    }

    doRun() {
        console.log("doRun:", this.runBuffer.length);
        if (this.state.running) {
            let line = this.runBuffer.shift();
            if (line != null) {
                console.log("Publish: " + line);
                GrblSender.sendMessage(line, this.doRun);
            }
            else {
                console.log("Null line encountered");
            }
        }

    }

    stopRun() {
        this.setState({
            "running": false
        });
    }

    refAceEditorCallback(ref) {
        this.refAceEditor = ref;
        console.log("Reference to ace editor", ref);
        this.refAceEditor.editor.setAutoScrollEditorIntoView(true);
    }

    componentDidUpdate() {
        if (this.refAceEditor) {
            this.refAceEditor.editor.resize();
        }
    }

    render() {

        return (
            <div className="editor-view flex-grow flex flex-column">
                <div>
                    <Button color="primary" onClick={ this.doParse }>Parse</Button>
                    <Button color="primary" onClick={ this.startRun }>Run</Button>
                </div>
                <AceEditor
                    mode="gcode"
                    theme="github"
                    value={ this.editorCode }
                    onChange={this.onChange}
                    name="UNIQUE_ID_OF_DIV"
                    editorProps={{$blockScrolling: true}}
                    ref={ this.refAceEditorCallback }
                    height="auto"
                    width="auto"
                    className="flex-grow"
                />
            </div>)
    }
}
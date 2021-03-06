import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import {observer} from 'mobx-react';
import styled from 'styled-components';
import connectionStore from '../../stores/connectionStore';
import gcodeStore from '../../stores/gcodeStore';
import { p } from '../../stores/gcodeStore';
import { List } from 'react-virtualized';
import autoBind from 'auto-bind';

import AceEditor from 'react-ace';

import 'brace/mode/gcode';
import 'brace/theme/merbivore';


class EditorStore {
    @observable scrollTop = 0;
    @observable rowHeight = 20;
    @action
    setScrollTop(scrollTop) {
        this.scrollTop = scrollTop
    }
}

const editorStore = new EditorStore();

const syntax_attribute = /^[XYZIJKRF]$/;
const syntax_command = /^[G\d]+$/;
const syntax_number = /^[\d.\-]+$/;
const syntaxHilight = (item) => {
    if (syntax_attribute.exec(item)) {
        return <span className="editor--attr">{ item }</span>
    } else if (syntax_number.exec(item)) {
        return <span className="editor-num">{ item }</span>
    } else if (syntax_command.exec(item)) {
        return <span className="editor-cmd">{ item }</span>
    } else {
        return item;
    }
};

@observer
class Line extends React.Component {
    render() {
        let content = p.lines[this.props.number];
        let split = content.split(/([XYZIJKRF]|[G\d]+|[\d.\-]+)/);
        content = split.map((item) => syntaxHilight(item));
        return (
            <div className={ this.props.className }>
                <span className="editor--ln">{ `${this.props.number}`.padStart(p.lines.length.toString().length, " ") }</span>
                <span className="editor--code">{ content }</span>
            </div>
        );
    }
}
const rowRenderer = ({
                         key,         // Unique key within array of rows
                         index,       // Index of row within collection
                         isScrolling, // The List is currently being scrolled
                         isVisible,   // This row is visible within the List (eg it is not an overscanned row)
                         style        // Style object to be applied to row (to position it)
                     }) => (
    <div
        key={key}
        style={style}
    >
        <Line number={index}/>
    </div>
);


Line.propTypes = {
    number: PropTypes.number.isRequired,
};

Line = styled(Line)`
  .editor--ln {
    display: inline-block;
    padding-right: 2px;
    margin-right: 2px;
    border-right: 1px solid white;
    height: ${editorStore.rowHeight}px;
    white-space: pre-wrap;
  }
  .editor--attr {
    color: red;
  }
  .editor-cmd {
    color: lime;
  }
  .editor-num {
    color: purple;
  }
`;


@observer
class Editor extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
        this.state = {
            width: 400,
            height: 400,
        }
    }
    componentDidMount() {
        if (this.container) {
            this.setState({
                width: this.container.offsetWidth,
                height: this.container.offsetHeight,
            })
        }
    }

    importFile(e) {
        console.log("import", e, e.target.files);
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = function(e) {
            let contents = e.target.result;
            p.parseStream(contents);
        };
        reader.readAsText(file);
    }

    render() {
        return (
            <div className={ this.props.className }>
                <div id="editor--file-controls">
                    <label htmlFor="editor--file-picker">Import</label>
                    <input onChange={ (e) => this.importFile(e) } id="editor--file-picker" type="file"/>
                </div>
                <div ref={ (r) => this.container = r } id="editor--container">
                    <AceEditor
                        mode="gcode"
                        theme="merbivore"
                        name="editor--ace"
                        value={p.content}
                        wrapEnabled={ true }
                        width={ this.state.width }
                        height={ this.state.height }
                    />
                </div>
            </div>
        )
    }
}

export default styled(Editor)`
  background-color: black;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  #editor--file-controls {
    display: flex;
    background-color: #223300;
    #editor--file-picker {
      display: none;
    }
  }
  
  #editor--container {
    flex-grow: 1;
  }
`;

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

class EditorStore {
    @observable scrollTop = 0;
    @observable rowHeight = 20;
    @action
    setScrollTop(scrollTop) {
        this.scrollTop = scrollTop
    }
}

const editorStore = new EditorStore();



@observer
class Line extends React.Component {
    render() {
        return (
            <div className={ this.props.className }>
                <span className="editor--ln">{ `${this.props.number}`.padStart(p.lines.length.toString().length, " ") }</span>
                <span className="editor--code">{p.lines[this.props.number]}</span>
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
`


@observer
class Editor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            containerWidth: 100,
            containerHeight: 100,
        }
        autoBind(this);
    }
    componentDidMount() {
        this.setState({
            containerWidth: this.container.offsetWidth,
            containerHeight: this.container.offsetHeight,
        })
    }

    handleScroll(e) {
        editorStore.setScrollTop(e.scrollTop);
    }
    render() {
        return (
            <div className={ this.props.className } ref={ (r) => this.container = r}>
                <List
                    width={ this.state.containerWidth }
                    height={ this.state.containerHeight }
                    rowCount={ p.lines.length }
                    rowRenderer={ rowRenderer }
                    rowHeight={ editorStore.rowHeight }
                    onScroll={ (e) => this.handleScroll(e) }
                    scrollTop={ editorStore.scrollTop }
                />
            </div>
        )
    }
}

export default styled(Editor)`
  background-color: black;
  flex-grow: 1;
  display: flex;
  font-family: "Lucida Console", Monaco, monospace;
  textarea {
    flex-grow: 1;
  }
`;

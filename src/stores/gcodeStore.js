import {observable, action, autorun} from 'mobx';
import Enum from 'es6-enum';

const gregex = /([GFXYZIJKR])(-?[\d.]+)+/gi;


/**
 * @property RAPID      G0
 * @property MOVE       G1
 * @property CW_ARC     G2
 * @property CCW_ARC    G3
 * @type {*|void}
 */
export const Motion = Enum(
    "MOVE", "RAPID", "CW_ARC", "CCW_ARC"
);

/**
 * @property ABSOLUTE
 * @property RELATIVE
 * @type {*|void}
 */
export const CoordinateMode = Enum(
    "ABSOLUTE", "RELATIVE"
);

/**
 * @property METRIC
 * @property IMPERIAL
 */
export const UnitMode = Enum(
    "METRIC", "IMPERIAL"
);

console.log(Motion);

const GMap = {
    G0: Motion.RAPID,
    G1: Motion.MOVE,
    G2: Motion.CW_ARC,
    G3: Motion.CCW_ARC,
    G20: UnitMode.IMPERIAL,
    G21: UnitMode.METRIC,
    G90: CoordinateMode.ABSOLUTE,
    G91: CoordinateMode.RELATIVE
};


class StateMachine {
    state = {};
    buffer = {};
    constructor() {
        this.state = {
            X: 0,
            Y: 0,
            Z: 0,
            xMin: 0,
            xMax: 0,
            yMin: 0,
            yMax: 0
        }
    }

    addLinear(key, value) {
        // Check mode
        switch (this.state.coordinateMode) {
            case CoordinateMode.RELATIVE:
                this.state[key] += parseFloat(value);
                break;
            case CoordinateMode.ABSOLUTE:
                this.state[key] = parseFloat(value);
                break;
            default:
                console.warn("No coordinate mode set");
        }
    }

    addArcRadius(buffer) {
        /** See grbl gcode.c */

        const R = parseFloat(buffer.R);
        const X = parseFloat(buffer.X) - this.state.X; // TODO make helper func
        const Y = parseFloat(buffer.Y) - this.state.Y;


        let h_x2_div_d = 4.0 * Math.pow(R, 2) - Math.pow(X, 2) - Math.pow(Y, 2);
        if (h_x2_div_d < 0) {
            console.error("Arc radius error", h_x2_div_d); // TODO
        }
        h_x2_div_d = -Math.sqrt(h_x2_div_d) / Math.sqrt(Math.pow(X, 2) + Math.pow(Y, 2));
        if (this.state.motion === Motion.CCW_ARC) { h_x2_div_d = -h_x2_div_d; }

        if (R < 0) {
            h_x2_div_d = -h_x2_div_d;
            buffer.R = -R;
        }

        buffer.I = 0.5*(X-(Y*h_x2_div_d));
        buffer.J = 0.5*(Y+(X*h_x2_div_d));

        this.addArcIJK(buffer);

    }
    addArcIJK(buffer) {
        this.state.arc = {
            cx: buffer.I ? this.state.X + parseFloat(buffer.I) : this.state.X,
            cy: buffer.J ? this.state.Y + parseFloat(buffer.J) : this.state.Y,
            cz: buffer.K ? this.state.Z + parseFloat(buffer.K) : this.state.Z,
            sx: this.state.X,
            sy: this.state.Y,
            sz: this.state.Z,
            cw: this.state.motion === Motion.CW_ARC
        };
        if (buffer.X !== undefined) {
            this.addLinear("X", buffer.X);
        }
        if (buffer.Y !== undefined) {
            this.addLinear("Y", buffer.Y);
        }
        if (buffer.Z !== undefined) {
            this.addLinear("Z", buffer.Z);
        }

    }

    latch() {
        if (this.buffer.motion) {
            this.state.motion = this.buffer.motion;
        }
        if (this.buffer.coordinateMode) {
            this.state.coordinateMode = this.buffer.coordinateMode;
        }
        if (this.buffer.unitMode) {
            this.state.unitMode = this.buffer.unitMode;
        }

        switch (this.state.motion) {
            case Motion.RAPID:
            case Motion.MOVE:
                for (let key of ["X", "Y", "Z"]) {
                    if (this.buffer[key] !== undefined) this.addLinear(key, this.buffer[key]);
                }
                break;
            case Motion.CW_ARC:
            case Motion.CCW_ARC:
                if ("R" in this.buffer && ("X" in this.buffer || "Y" in this.buffer || "Z" in this.buffer)) {
                    this.addArcRadius(this.buffer);
                } else if ("I" in this.buffer || "J" in this.buffer || "K" in this.buffer) {
                    this.addArcIJK(this.buffer);
                } else {
                    console.log("Warning, unable to process move", this.buffer);
                }
                break;
        }
        this.buffer = {};
    }
    prepare(match, word, value) {
        if (word === "G") {
            word = GMap[`G${parseInt(value)}`];
            switch (word) {
                case Motion.RAPID:
                case Motion.MOVE:
                case Motion.CW_ARC:
                case Motion.CCW_ARC:
                    this.buffer.motion = word;
                    break;
                case CoordinateMode.ABSOLUTE:
                case CoordinateMode.RELATIVE:
                    this.buffer.coordinateMode = word;
                    break;
                case UnitMode.IMPERIAL:
                case UnitMode.METRIC:
                    this.buffer.unitMode = word;
                break;
                default:
                    console.warn("Unknown word", word, match);
            }
        } else {
            this.buffer[word] = value;
        }
    }

    getState() {
        const state = {
            X: this.state.X,
            Y: this.state.Y,
            Z: this.state.Z,
            motion: this.state.motion
        };
        if (state.motion === Motion.CW_ARC || state.motion === Motion.CCW_ARC) {
            state.arc = this.state.arc;
        }
        return state;
    }
}


class Program {
    @observable
    lines = [];

    @observable
    content = null;

    @observable
    actions = [];

    @action
    parseLines(lines) {
        let start = Date.now();
        this.lines.replace(lines);
        let state = new StateMachine();
        let actions = [];
        for (let line of lines) {
            let match;
            while (match = gregex.exec(line)) {
                state.prepare(...match);
            }
            state.latch();
            actions.push(state.getState());
        }
        console.log("OK");
        this.actions = observable.array(actions, { deep: false });
        console.log("REPLACED", this.actions);
        console.log("Time taken", Date.now() - start, "ms");
    }

    parseStream(stream) {
        this.content = stream;
        this.parseLines(stream.split(/\r?\n/));
    }
}

class Layer {
    @observable
    copper = null;

    @observable
    drill = null;
}

class GcodeStore {
    @observable
    program = null;
}

const gcodeStore = new GcodeStore();
export default gcodeStore;
export const p = new Program();
p.parseStream(`%
(FCU engravings)
(T7  D=0.58 CR=0 - ZMIN=-0.3 - flat end mill)
G90 G94
G17
G21
G28 G91 Z0
G90

(Non-text)
M9
T7 M6
S24000 M3
G54
M8
G0 X10.141 Y47.885
Z15
Z5
G1 Z0.158 F83
G3 X10.153 Y47.875 Z0.118 I3.859 J4.865 F83.3
X10.185 Y47.85 Z0.1 I3.847 J4.875
X19.749 Y50.401 Z-0.3 I3.815 J4.9
X20.21 Y52.75 I-5.749 J2.349 F83
Y52.763 I-6.21 J0.007
X14 Y58.96 I-6.21 J-0.013
Y46.54 J-6.21
X19.749 Y50.401 J6.21
X19.75 Y50.441 Z-0.283 I-0.054 J0.022
X19.742 Y50.457 Z-0.242 I-0.055 J-0.018
G0 Z5
X14.281 Y58.733
G1 Z0.158 F83
G2 X14.297 Z0.118 I-0.281 J-5.983 F83.3
X14.337 Y58.731 Z0.1 I-0.297 J-5.983
X19.522 Y50.43 Z-0.3 I-0.337 J-5.981
X14 Y46.76 I-5.522 J2.32 F83
X13.987 I-0.007 J5.99
X8.01 Y52.75 I0.013 J5.99
X19.99 I5.99
X19.522 Y50.43 I-5.99
G3 X19.521 Y50.39 Z-0.283 I0.053 J-0.022
X19.528 Y50.375 Z-0.242 I0.055 J0.018
G0 Z15
X47.988 Y38.481
`);

gcodeStore.program = p;

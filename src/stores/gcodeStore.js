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
    layers = []
}

export const p = new Program();

p.parseStream(`
G90
F500
G00 X0 Y0
G03 Y-10 J-5
G02 Y-20 J-5
G01 X14 Y58.96
G03 Y46.54 J-6.21`);

export default new GcodeStore();

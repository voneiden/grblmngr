/**
 GrblMgmr is a frontend application to interface with Grbl via GrblMQTT
 Copyright (C) 2016-2017 Matti Eiden

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

/**
 * GParser takes line(s) of GCode
 */
import Enum from 'es6-enum';

const regexClean = /[^\dGXYZIJKF.+-]/gi;

/**
 * @property {Symbol} DWELL
 * @property {Symbol} RETURN_TO_HOME
 * @property {Symbol} RETURN_TO_SECONDARY_HOME
 * @type {Enum}
 */
const NonModalCommand = new Enum("DWELL", "RETURN_TO_HOME", "RETURN_TO_SECONDARY_HOME"); // G4, G28, G30

/**
 * @property {Symbol} RAPID
 * @property {Symbol} LINEAR
 * @property {Symbol} CW_ARC
 * @property {Symbol} CCW_ARC
 * @property {Symbol} PROBE_TOWARD_STOP_OR_ERROR
 * @property {Symbol} PROBE_TOWARD_STOP
 * @property {Symbol} PROBE_AWAY_STOP_OR_ERROR
 * @property {Symbol} PROBE_AWAY_STOP
 * @type {Enum}
 */
const MotionMode = new Enum("RAPID", "LINEAR", "CW_ARC", "CCW_ARC", "PROBE_TOWARD_STOP_OR_ERROR", "PROBE_TOWARD_STOP", "PROBE_AWAY_STOP_OR_ERROR", "PROBE_AWAY_STOP"); // G0 G1 G2 G3 G38.2 G38.3 G38.4 G38.5

/**
 * @property {Symbol} INVERSE_TIME
 * @property {Symbol} UNITS_PER_MINUTE
 * @type {Enum}
 */
const FeedRateMode = new Enum("INVERSE_TIME", "UNITS_PER_MINUTE"); // G93 G94

/**
 * @property {Symbol} IMPERIAL
 * @property {Symbol} METRIC
 * @type {Enum}
 */
const UnitMode = new Enum("IMPERIAL", "METRIC"); // G20 G21

/**
 * @property {Symbol} ABSOLUTE
 * @property {Symbol} RELATIVE
 * @type {Enum}
 */
const DistanceMode = new Enum("ABSOLUTE", "RELATIVE"); //G90 G91

/**
 * @property {Symbol} RELATIVE
 * @type {Enum}
 */
const ArcDistanceMode = new Enum("RELATIVE"); // G91.1


const GCodeMap = {
    G0: MotionMode.RAPID,
    G1: MotionMode.LINEAR,
    G2: MotionMode.CW_ARC,
    G3: MotionMode.CCW_ARC,
    G4: NonModalCommand.DWELL,
    G20: UnitMode.IMPERIAL,
    G21: UnitMode.METRIC,
    G28: NonModalCommand.RETURN_TO_HOME,
    G30: NonModalCommand.RETURN_TO_SECONDARY_HOME,
    "G38.2": NonModalCommand.PROBE_TOWARD_STOP_OR_ERROR,
    "G38.3": NonModalCommand.PROBE_TOWARD_STOP,
    "G38.4": NonModalCommand.PROBE_AWAY_STOP_OR_ERROR,
    "G38.5": NonModalCommand.PROBE_AWAY_STOP,
    G90: DistanceMode.ABSOLUTE,
    G91: DistanceMode.RELATIVE,
    "G91.1": ArcDistanceMode.RELATIVE,
    G93: FeedRateMode.INVERSE_TIME,
    G94: FeedRateMode.UNITS_PER_MINUTE

};

class GParser {
    static parseLines(line) {

    }
    static interpretLine(line) {
        line = line.replace(regexClean, "");
    }
}


/*

UNITS_METRIC = 20;
UNITS_IMPERIAL = 21;

MODE_ABSOLUTE = 90;
MODE_RELATIVE = 91;

MOVE_RAPID = 0;
MOVE_LINEAR = 1;

export default class GCodeConverter {
    static toPath(gcode) {
        let state = {
            units: MODE_RELATIVE,
            mode: MODE_ABSOLUTE,
            x: 0,
            y: 0,
            z: 0
        };

        let paths = [];
        let move = null;



        for (let i=0; i < gcode.length; i++) {
            let line = gcode[i];

            let x = 0;
            let y = 0;
            let z = 0;

            for (let w=0; w < line.words.length; w++) {
                let word = line.words[w];
                switch (word[0]) {
                    case "G":
                        switch (word[1]) {
                            case UNITS_IMPERIAL:
                                state.units = UNITS_IMPERIAL;
                                break;

                            case UNITS_METRIC:
                                state.units = UNITS_METRIC;
                                break;

                            case MODE_ABSOLUTE:
                                state.mode = MODE_ABSOLUTE;
                                break;
                            case MODE_RELATIVE:
                                state.mode = MODE_RELATIVE;
                                break;

                            case MOVE_RAPID:
                            case MOVE_LINEAR:
                                move = MOVE_LINEAR;

                        }
                        break;
                    // TODO imperial conversion
                    case "X":
                        x = word[1];
                        break;

                    case "Y":
                        y = word[1];
                        break;

                    case "Z":
                        z = word[1];
                        break;


                }
            }

            x |= state.x;
            y |= state.y;
            z |= state.z;

            if (x != state.x || y != state.y || z != state.z) {
                switch (move) {
                    case MOVE_LINEAR:
                        paths.push([x, y, z])
                }
            }

        }

        return paths;
    }
}

*/
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

import {MotionMode, UnitMode, NonModalCommand, DistanceMode, ArcDistanceMode, FeedRateMode} from "./GCodeConstants";

export const GCodeMap = {
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

// TODO custom implementation of es6-enum
export const GCodeType = {
    G0: MotionMode,
    G1: MotionMode,
    G2: MotionMode,
    G3: MotionMode,
    G4: NonModalCommand,
    G20: UnitMode,
    G21: UnitMode,
    G28: NonModalCommand,
    G30: NonModalCommand,
    "G38.2": NonModalCommand,
    "G38.3": NonModalCommand,
    "G38.4": NonModalCommand,
    "G38.5": NonModalCommand,
    G90: DistanceMode,
    G91: DistanceMode,
    "G91.1": ArcDistanceMode,
    G93: FeedRateMode,
    G94: FeedRateMode
};

export default class GCodeParser {
    static parseLines(lines) {
        // TODO webworkers
        return parseLines(lines);
    }
    static parseLine(line) {
        return readCommandsRegex(line);
    }
}

function parseLines(lines) {
    let results = [];
    let result;
    for (let i=0; i < lines.length; i++) {
        result = readCommandsRegex(lines[i]);
        if (result) {
            results[results.length] = result;
        }
    }
    return results;
}

const commandMatcher = /([GXYZIJKF])+(\d+(?:\.\d+)?)/gi;
export function readCommandsRegex(line) {
    // Get rid of whitespaces

    line = line.replace(/\s/g, "");
    let commands = line.match(commandMatcher);
    if (commands) {
        let output = {};
        for (let i=0; i < commands.length; i++) {
            commandToOutput(commands[i].toUpperCase(), output);
        }
        return output;
    }
    return null;
}

function commandToOutput(command, output) {
    switch (command[0]) {
        case "G":
            output[GCodeType[command]] = GCodeMap[command];
            return;
        case "F":
        case "X":
        case "Y":
        case "I":
        case "J":
        case "K":
        case "Z":
            output[command[0]] = command.slice(1);
            return;

        default:
            return;
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
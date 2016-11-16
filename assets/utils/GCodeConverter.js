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
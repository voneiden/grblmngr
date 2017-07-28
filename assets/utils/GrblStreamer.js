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

import GrblSender from "utils/GrblSender";

const REGEX_CLEANER = /\s|\r|\n/gi;
const GRBL_BUFFER_SIZE = 128;
let GRBL_BUFFER_USED = 0;
let lineStreamer = null;


export default class GrblStreamer {
    static isBusy() {
        return lineStreamer !== null && lineStreamer.done;
    }
    static streamLines(lines) {
        if (GrblStreamer.isBusy()) {
            throw "GrblStreamer is busy";
        }

        GRBL_BUFFER_USED = 0;
        lineStreamer = LineStreamer(lines);
        lineStreamer.next();
    }
}

function reset() {
}

function* LineStreamer(lines) {
    for (let line of lines) {
        let preparedLine = prepareSendLine(line);
        if (preparedLine.length < GRBL_BUFFER_SIZE) {
            throw "LineStreamer line is too long to fit GRBL buffer: " + GRBL_BUFFER_SIZE;
        }
        while (GRBL_BUFFER_SIZE - GRBL_BUFFER_USED < preparedLine.length) {
            yield;
        }
        GrblSender.sendRealtime(line, (error) => handleResponse(line.length, error));
        GRBL_BUFFER_USED += line.length;
    }
}

/**
 * Strip useless whitespaces and append line feed
 * @param line
 */
function prepareSendLine(line) {
    return `${line.replace(REGEX_CLEANER, "")}\n`;
}

function handleResponse(length, error) {
    if (error) {
        // TODO HALT
    } else {
        GRBL_BUFFER_USED -= length;
        lineStreamer.next();
    }
}
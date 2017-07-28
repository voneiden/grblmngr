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


const MachineStates = ["Idle", "Run", "Hold", "Jog", "Alarm", "Door", "Check", "Home", "Sleep"];

// <Idle|MPos:0.000,0.000,0.000|FS:0,0|WCO:0.000,0.000,0.000>

export default class GrblInterface {
    constructor (sendCallback) {
        this.machineState = "Unknown";


        this.sendCallback = sendCallback;

    }

    /*
     * Parses incoming data. Returns true/false depending if state changed
     */


    getMachineState() {
        return "Unknown" ? MachineStates.indexOf(this.machineState) == -1 : this.machineState
    }
}
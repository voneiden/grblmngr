import {observable, action} from 'mobx';
import connectionStore from './connectionStore';
import grblStore from './grblStore';
import gcodeStore from './gcodeStore';
import Enum from 'es6-enum';
import autoBind from 'auto-bind';
/**
 * @property UNKNOWN
 * @property IDLE
 * @property RUN
 * @property HOLD
 * @property JOG
 * @property ALARM
 * @property DOOR
 * @property CHECK
 * @property HOME
 * @property SLEEP
 *
 */
const MachineState = new Enum(
    'UNKNOWN', 'IDLE', 'RUN', 'HOLD', 'JOG', 'ALARM', 'DOOR', 'CHECK', 'HOME', 'SLEEP'
);

const stateMap = {
    'Idle': MachineState.IDLE,
    'Run': MachineState.RUN,
    'Hold': MachineState.HOLD,
    'Jog': MachineState.JOG,
    'Alarm': MachineState.ALARM,
    'Door': MachineState.DOOR,
    'Check': MachineState.CHECK,
    'Home': MachineState.HOME,
    'Sleep': MachineState.SLEEP
};

const stateRegex = /<(.+?):?(\d)?[|>]/g;
const stateDataRegex = /(MPos|FS|WCO|Ov):([\d.-]+),?([\d.-]+)?,?([\d.-]+)?/g;

class GrblStore {
    @observable
    machineState = MachineState.UNKNOWN;

    @observable
    MPos = {x: '0', y: '0', z: '0'};

    @observable
    WPos = {x: '0', y: '0', z: '0'};

    @observable
    WCO = {x: '0', y: '0', z: '0'};

    runLine = 0;
    running = false;

    constructor() {
        autoBind(this);
    }

    @action
    setMachineState(state, substate) {
        this.machineState = state;
        if (substate) {
            console.log("Unhandled substate:", substate);
        }
    }

    @action
    setMPos(x, y, z) {
        let MPos = this.MPos;
        if (MPos.x !== x || MPos.y !== y || MPos.z !== z) {
            this.MPos.x = x;
            this.MPos.y = y;
            this.MPos.z = z;
            let WCO = this.WCO;
            this.WPos.x = (parseFloat(x) - parseFloat(WCO.x)).toFixed(3);
            this.WPos.y = (parseFloat(y) - parseFloat(WCO.y)).toFixed(3);
            this.WPos.z = (parseFloat(z) - parseFloat(WCO.z)).toFixed(3);
        }
    }

    @action
    setWPos(x, y, z) {
        let WPos = this.WPos;
        if (WPos.x !== x || WPos.y !== y || WPos.z !== z) {
            this.WPos.x = x;
            this.WPos.y = y;
            this.WPos.z = z;
            let WCO = this.WCO;
            this.MPos.x = (parseFloat(x) + parseFloat(WCO.x)).toFixed(3);
            this.MPos.y = (parseFloat(y) + parseFloat(WCO.y)).toFixed(3);
            this.MPos.z = (parseFloat(z) + parseFloat(WCO.z)).toFixed(3);
        }
    }

    @action
    setWCO(x, y, z) {
        let WCO = this.WCO;
        if (WCO.x !== x || WCO.y !== y || WCO.z !== z) {
            this.WCO.x = x;
            this.WCO.y = y;
            this.WCO.z = z;
        }
    }

    run() {
        if (connectionStore.connected && this.machineState === MachineState.IDLE) {
            this.runLine = 0;
            this.running = true;
            this.runNextLine();
        } else {
            console.warn("Unable to run", connectionStore.connected, this.machineState);
        }
    }

    runNextLine() {
        if (connectionStore.connected && this.running) {
            if (this.runLine < gcodeStore.program.lines.length) {
                connectionStore.writeln(gcodeStore.program.lines[this.runLine]);
                this.runLine += 1;
            } else {
                console.log("Program completed");
                this.running = false;
            }
        } else {
            console.error("Unable to run next line", connectionStore.connected, this.running);
        }
    }

    pause() {
        if (connectionStore.connected && this.machineState === MachineState.RUN) {
            connectionStore.write('!');
        }
    }

    resume() {
        if (connectionStore.connected && this.machineState === MachineState.HOLD) {
            connectionStore.write('~');
        }
    }

    stop() {
        if (connectionStore.connected) {
            connectionStore.write('\x18')
        }
    }

    parseStatus(status) {
        // <Idle|MPos:0.000,0.000,0.000|FS:0,0|WCO:0.000,0.000,0.000>
        stateRegex.lastIndex = 0;
        stateDataRegex.lastIndex = 0;
        //console.log("Parse status", status);
        let match = stateRegex.exec(status);
        if (!match) {
            console.error("Invalid status line:", status);
            let obj = {
                r: stateRegex,

            }
        }
        let primaryState = stateMap[match[1]];
        if (!primaryState) {
            primaryState = MachineState.UNKNOWN;
        }
        this.setMachineState(primaryState, match[2]);
        while (match = stateDataRegex.exec(status)) {
            let key = match[1];
            if (key === 'MPos') {
                this.setMPos(match[2], match[3], match[4]);
            } else if (key === 'WPos') {
                this.setWPos(match[2], match[3], match[4]);
            } else if (key === 'WCO') {
                this.setWCO(match[2], match[3], match[4]);
            } else {
                console.log("Unhandled status key", key);
            }
        }
    }
}


export default new GrblStore();

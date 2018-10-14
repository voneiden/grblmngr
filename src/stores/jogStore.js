import {autorun, observable, action} from "mobx";
import * as THREE from "three";
import grblStore from './grblStore';
import connectionStore from './connectionStore';
import gcodeStore, {Motion} from "./gcodeStore";
import autoBind from "auto-bind";
import Enum from 'es6-enum';

/**
 * @property STEP
 * @property JOG
 */
const MotionMode = Enum('STEP', 'JOG');

class JogStore {
    @observable stepMultiplier = 1;
    @observable stepAmount = 1;
    @observable jogMode = MotionMode.JOG;

    @action
    jog(x, y, z) {
        if (grblStore.canJog()) {
            let buf = [];
            if (x) {
                buf.push(`X${x * this.stepAmount}`);
            }
            if (y) {
                buf.push(`Y${y * this.stepAmount}`);
            }
            if (z) {
                buf.push(`Z${z * this.stepAmount}`);
            }
            const command = `$J=G91 F300 ${buf.join(' ')}`; // TODO feedrate
            connectionStore.writeln(command); // TODO buffer check!
        }
    }
    step(x, y, z) {
        if (grblStore.canStep()) {
            let buf = [];
            if (x) {
                buf.push(`X${x * this.stepAmount}`);
            }
            if (y) {
                buf.push(`Y${y * this.stepAmount}`);
            }
            if (z) {
                buf.push(`Z${z * this.stepAmount}`);
            }

            const command = `G0 ${buf.join(' ')}`;
            connectionStore.writeln(command);
        }
    }


    stopJog() {
        if (grblStore.canStopJog()) {
            connectionStore.write('\x85');
        }
    }

    @action
    setJogMode() {
        this.jogMode = MotionMode.JOG;
    }

    @action
    setStepMode() {
        this.jogMode = MotionMode.STEP;
    }
}

const jogStore = new JogStore();
export default jogStore;
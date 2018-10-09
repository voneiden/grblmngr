import {autorun, observable, action} from "mobx";
import * as THREE from "three";
import grblStore from './grblStore';
import connectionStore from './connectionStore';
import gcodeStore, {Motion} from "./gcodeStore";
import autoBind from "auto-bind";

class JogStore {
    @observable stepMultiplier = 1;
    @observable stepAmount = 1;

    @action
    jog(x, y) {
        if (grblStore.canJog()) {
            let buf = [];
            if (x !== 0) {
                buf.push(`X${x * this.stepAmount}`);
            }
            if (y !== 0) {
                buf.push(`Y${y * this.stepAmount}`);
            }
            const command = `$J=G91 F300 ${buf.join(' ')}`; // TODO feedrate
            connectionStore.writeln(command); // TODO buffer check!
        }
    }

    stopJog() {
        if (grblStore.canStopJog()) {
            connectionStore.write('\x85');
        }
    }
}

const jogStore = new JogStore();
export default jogStore;
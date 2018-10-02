import {observable, action} from "mobx";
import Enum from 'es6-enum';

/**
 * @property UNKNOWN
 * @property IDLE
 *
 */
const MachineState = new Enum(
    "UNKNOWN", "IDLE"
);



class GrblStore {
    @observable
    machineState = MachineState.UNKNOWN;
}


export default new GrblStore();

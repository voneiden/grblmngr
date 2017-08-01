import {GCodeMap, GCodeType} from "./GCodeConstants";
import {MotionMode, UnitMode, NonModalCommand, DistanceMode, ArcDistanceMode, FeedRateMode, ModeGroups} from "./GCodeConstants";

const LinearAxes = ["X", "Y", "Z"];

class GrblMachine {
    /**
     * Setup initial state
     */
    constructor() {
        this.motionMode = null;
        this.unitMode = null;
        this.distanceMode = null;
        this.arcDistanceMode = ArcDistanceMode.RELATIVE;
        this.feedRateMode = null;
        this.F = null;
        this.X = 0;
        this.Y = 0;
        this.Z = 0;
    }

    step(stateStep) {

        if (stateStep[ModeGroups.MOTION]) {
            this.motionMode = stateStep[ModeGroups.MOTION];
        }

        if (stateStep[ModeGroups.UNIT]) {
            this.unitMode = stateStep[ModeGroups.UNIT];
        }

        switch (this.motionMode) {
            case MotionMode.LINEAR:
            case MotionMode.RAPID:
                for (let i=0; i < LinearAxes.length; i++) {
                    let axisValue = stateStep[LinearAxes[i]];
                    if (axisValue) {
                        if (this.distanceMode === DistanceMode.ABSOLUTE) {
                            this[LinearAxes[i]] = parseFloat(axisValue)
                        } else {
                            this[LinearAxes[i]] += parseFloat(axisValue);
                        }
                    }
                }
                break;
            default:
                break;
        }
        return [this.motionMode, this.X, this.Y, this.Z];
    }
}

export default class GrbSimulator {
    static simulate(stateSteps) {
        let machine = new GrblMachine();
        let results = [];
        for (let i=0; i < stateSteps.length; i++) {
            results[results.length] = machine.step(stateSteps[i]);
        }
        return results;
    }
}


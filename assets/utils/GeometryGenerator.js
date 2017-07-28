class GeometryGroup {

}
import GCodeToolpath from "gcode-toolpath";
import {Modals} from "GMConstants";

function vectorEquals(v1, v2) {
    return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
}

function rapidGroupInvolved(motion1, motion2) {
    return (motion1 !== motion2 && (motion1 === Modals.RAPID || motion2 === Modals.RAPID))
}

function addToolpath(toolpath, geometryGroups) {
    switch (toolpath.motion) {
        case "G0": toolpath.motion = Modals.LINEAR; break;
        case "G1": toolpath.motion = Modals.RAPID; break;
        case "G2": toolpath.motion = Modals.CW_ARC; break;
        case "G3": toolpath.motion = Modals.CCW_ARC; break;
    }
    let lastGroup = geometryGroups[geometryGroups.length - 1];
    let lastToolpath = lastGroup.members[lastGroup.members.length - 1];
    if (lastToolpath && (!vectorEquals(toolpath.v1, lastToolpath.v2) || rapidGroupInvolved(toolpath.motion, lastToolpath.motion))) {
        lastGroup = {members: []};
        geometryGroups.push(lastGroup);
    }
    lastGroup.members.push(toolpath);

}

class GeometryGenerator {
    static generateGeometry(gCodeLines) {
        let geometryGroups = [{members: []}];


        let gCodeToolpath = new GCodeToolpath({
            modalState: {},
            addLine: (modalState, v1, v2, v0) => {
                addToolpath({
                    motion: modalState.motion,
                    v1: v1,
                    v2: v2
                }, geometryGroups);

                if (geometryGroup.members.length &&
                    vectorEquals(v1, geometryGroup.members[geometryGroup.members.length - 1].v2)) {

                }
            },
            addArcCurve: (modalState, v1, v2, v0) => {
                addToolpath({
                    motion: modalState.motion,
                    v1: v1,
                    v2: v2,
                    v0: v0
                }, geometryGroups);
            }
        });

        gCodeToolpath.loadFromString(gCodeLines, (error, results) => {
            console.log("Error:", error);
            console.log("Results:", results);
        });
    }
}
import Enum from 'es6-enum';

export const regexClean = /[^\dGXYZIJKF.+-]/gi;

/**
 * @property {Symbol} DWELL
 * @property {Symbol} RETURN_TO_HOME
 * @property {Symbol} RETURN_TO_SECONDARY_HOME
 */
export const NonModalCommand = new Enum("DWELL", "RETURN_TO_HOME", "RETURN_TO_SECONDARY_HOME"); // G4, G28, G30

/**
 * @property {Symbol} RAPID
 * @property {Symbol} LINEAR
 * @property {Symbol} CW_ARC
 * @property {Symbol} CCW_ARC
 * @property {Symbol} PROBE_TOWARD_STOP_OR_ERROR
 * @property {Symbol} PROBE_TOWARD_STOP
 * @property {Symbol} PROBE_AWAY_STOP_OR_ERROR
 * @property {Symbol} PROBE_AWAY_STOP
 */
export const MotionMode = new Enum("RAPID", "LINEAR", "CW_ARC", "CCW_ARC", "PROBE_TOWARD_STOP_OR_ERROR", "PROBE_TOWARD_STOP", "PROBE_AWAY_STOP_OR_ERROR", "PROBE_AWAY_STOP"); // G0 G1 G2 G3 G38.2 G38.3 G38.4 G38.5

/**
 * @property {Symbol} INVERSE_TIME
 * @property {Symbol} UNITS_PER_MINUTE
 */
export const FeedRateMode = new Enum("INVERSE_TIME", "UNITS_PER_MINUTE"); // G93 G94

/**
 * @property {Symbol} IMPERIAL
 * @property {Symbol} METRIC
 */
export const UnitMode = new Enum("IMPERIAL", "METRIC"); // G20 G21

/**
 * @property {Symbol} ABSOLUTE
 * @property {Symbol} RELATIVE
 */
export const DistanceMode = new Enum("ABSOLUTE", "RELATIVE"); //G90 G91

/**
 * @property {Symbol} RELATIVE
 */
export const ArcDistanceMode = new Enum("RELATIVE"); // G91.1

/**
 * @property {Symbol} MOTION
 * @property {Symbol} NON_MODAL
 * @property {Symbol} UNIT
 * @property {Symbol} DISTANCE
 * @property {Symbol} ARC_DISTANCE
 * @property {Symbol} FEED_RATE
 */
export const ModeGroups = new Enum("MOTION", "NON_MODAL", "UNIT", "DISTANCE", "ARC_DISTANCE", "FEED_RATE");

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

export const GCodeType = {
    G0: ModeGroups.MOTION,
    G1: ModeGroups.MOTION,
    G2: ModeGroups.MOTION,
    G3: ModeGroups.MOTION,
    G4: ModeGroups.NON_MODAL,
    G20: ModeGroups.UNIT,
    G21: ModeGroups.UNIT,
    G28: ModeGroups.NON_MODAL,
    G30: ModeGroups.NON_MODAL,
    "G38.2": ModeGroups.NON_MODAL,
    "G38.3": ModeGroups.NON_MODAL,
    "G38.4": ModeGroups.NON_MODAL,
    "G38.5": ModeGroups.NON_MODAL,
    G90: ModeGroups.DISTANCE,
    G91: ModeGroups.DISTANCE,
    "G91.1": ModeGroups.ARC_DISTANCE,
    G93: ModeGroups.FEED_RATE,
    G94: ModeGroups.FEED_RATE
};


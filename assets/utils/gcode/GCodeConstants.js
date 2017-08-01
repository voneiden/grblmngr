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



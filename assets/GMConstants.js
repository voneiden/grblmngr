import Enum from "es6-enum";

/**
 * @property {symbol} MAIN
 */
export const ActionReducer = Enum("MAIN");

/**
 * @property {symbol} DISCONNECTED
 * @property {symbol} CONNECTING
 * @property {symbol} CONNECTED
 */
export const MqttState = Enum("DISCONNECTED", "CONNECTING", "CONNECTED");

/**
 * @property {symbol} SET_STATE
 */
export const MqttAction = Enum("SET_STATE");

/**
 * @property {symbol} DISCONNECTED
 * @property {symbol} FETCH_PORTS
 * @property {symbol} CONNECTING
 * @property {symbol} CONNECTED
 */
export const SerialState = Enum("DISCONNECTED", "FETCH_PORTS", "CONNECTING", "CONNECTED");

/**
 * @property {symbol} SET_STATE
 * @property {symbol} SET_PORTS
 */
export const SerialAction = Enum("SET_STATE", "SET_PORTS");

/**
 * @property {symbol} IDLE  - Grbl state when the machine is not doing anything
 * @property {symbol} RUN   - Grbl state when the machine is executing code
 * @property {symbol} HOLD  - Grbl state when feed hold is issued
 * @property {symbol} JOG   - Grbl state when jogging
 * @property {symbol} ALARM - Grbl state when a critical error has occurred
 * @property {symbol} DOOR  - Grbl state when machine door is open
 * @property {symbol} CHECK - ?
 * @property {symbol} HOME  - Grbl state when homing
 * @property {symbol} SLEEP - Grbl state when sleeping
 *///Idle, Run, Hold, Jog, Alarm, Door, Check, Home, Sleep
export const GrblState = Enum("IDLE", "RUN", "HOLD", "JOG", "ALARM", "DOOR", "CHECK", "HOME", "SLEEP");

/**
 * @property {symbol} SET_STATE
 */
export const GrblAction = Enum("SET_STATE");
import Enum from "es6-enum";

/**
 * @property {symbol} MAIN
 */
export const ActionReducer = Enum(
    "MAIN"
);

/**
 * @property {symbol} DISCONNECTED
 * @property {symbol} CONNECTING
 * @property {symbol} CONNECTED
 */
export const MqttState = Enum(
    "DISCONNECTED",
    "CONNECTING",
    "CONNECTED"
);

/**
 * @property {symbol} SET_STATE
 */
export const MqttAction = Enum(
    "SET_STATE"
);


/**
 * @property {symbol} DISCONNECTED
 * @property {symbol} CONNECTING
 * @property {symbol} CONNECTED
 */
export const SerialState = Enum(
    "DISCONNECTED",
    "CONNECTING",
    "CONNECTED"
);

/**
 * @property {symbol} SET_STATE
 * @property {symbol} SET_PORTS
 */
export const SerialAction = Enum(
    "SET_STATE",
    "SET_PORTS"
);

/**
 * @property {symbol} IDLE
 */
export const GrblState = Enum(
    "IDLE"
);

/**
 * @property {symbol} SET_STATE
 */
export const GrblAction = Enum(
    "SET_STATE"
);
import Enum from "es6-enum";

/**
 * @property {symbol} DISCONNECTED
 * @property {symbol} CONNECTING
 * @property {symbol} CONNECTED
 */
export const MQTT = Enum(
    "DISCONNECTED",
    "CONNECTING",
    "CONNECTED"
);


/**
 * @property {symbol} DISCONNECTED
 * @property {symbol} CONNECTING
 * @property {symbol} CONNECTED
 */
export const SERIAL = Enum(
    "DISCONNECTED",
    "CONNECTING",
    "CONNECTED"
);

/**
 * @property {symbol} IDLE
 */
export const GRBL = Enum(
    "IDLE"
);
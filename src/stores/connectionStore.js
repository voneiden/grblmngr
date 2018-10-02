import {decorate, observable, action} from "mobx";

let Electron = null;
try {
    Electron = require('electron');
} catch (e) {
    console.log("CAttthcy");
}

class ConnectionStore {
    serialport = null;
    connected = false;
    ports = null;
    port = null;
    portInfo = null;

    constructor() {
        if (Electron && Electron.remote) {
            this.serialport = Electron.remote.getGlobal('serialport');
            this.refreshPorts();
        }
    }

    setPorts(ports) {
        console.log("Set ports to ", ports),
        this.ports = ports;
        console.log(this.ports);
    }

    refreshPorts() {
        this.ports = null;
        this.serialport.list().then((ports) => this.setPorts(ports));
    }


    get activePortName() {
        console.log(this.connected, !this.connected, this.connected == false, this.connected === false);
        if (!this.connected) { return "Not connected"; }
        return this.connected;
    }
    /*
    listPorts() {
        SerialPort.list().then((portinfo) => {
            this.portInfo = portinfo;
        });
    }
    */

}
decorate(ConnectionStore, {
    connected: observable,
    port: observable,
    ports: observable,
    setPorts: action,
    refreshPorts: action
});


export default new ConnectionStore();

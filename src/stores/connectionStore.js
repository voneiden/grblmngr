import {decorate, observable, action} from "mobx";

let Electron = null;
try {
    Electron = require('electron');
} catch (e) {
    console.log("CAttthcy");
}

class ConnectionStore {
    serialport = null;
    @observable connected = false;
    @observable ports = null;
    @observable port = null;
    @observable history = [];
    portInfo = null;


    constructor() {
        if (Electron && Electron.remote) {
            this.serialport = Electron.remote.getGlobal('serialport');
            this.refreshPorts();
        }
    }

    setPorts(ports) {
        this.ports = ports;
    }

    @action
    refreshPorts() {
        this.ports = null;
        this.serialport.list().then((ports) => this.setPorts(ports));
    }


    get activePortName() {
        if (!this.connected) { return "Not connected"; }
        return this.connected;
    }

    @action
    open(path) {
        this.port = new this.serialport(path, {baudRate: 115200}, (arg1, arg2) => this.handleOpen(arg1, arg2));
        const parser = this.port.pipe(new this.serialport.parsers.Readline({delimiter: '\r'}));
        parser.on('data', (data) => this.handleData(data));
    }

    @action
    close() {
        console.log("Port close action called");
        if (this.port) {
            this.port.close();
            this.port = null;
        }
        this.history.clear();
    }

    writeln(line) {
        if (this.port) {
            this.port.write(`${line}\r`)
        }
    }

    handleOpen(arg1, arg2) {
        console.log("Open", arg1, arg2);

    }

    @action
    handleData(data) {
        this.history.push(data);
        console.log("Recv:", data);
    }

}


export default new ConnectionStore();

import {decorate, observable, action} from 'mobx';
import grblStore from './grblStore';

let Electron = null;
try {
    Electron = require('electron');
} catch (e) {
    console.error("Electron context is not available, unable to start app", e);
}

const handshakeRegex = /Grbl (.+) \['\$' for help]/;

class ConnectionStore {
    serialport = null;
    @observable grblVersion = null;
    @observable connected = false;
    @observable ports = null;
    @observable port = null;
    @observable history = [];
    portInfo = null;
    @observable statusQueryInProgress = false;
    @observable statusQueryTimer = null;


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
        this.port.on('close', (reasons) => this.handleClose(reasons));
        this.port.on('error', (error) => this.handleError(error));
        const parser = this.port.pipe(new this.serialport.parsers.Readline({delimiter: '\r\n'}));
        parser.on('data', (data) => this.handleData(data));
    }

    @action
    close() {
        console.log("Port close action called");
        if (this.port) {
            try {
                this.port.close();
            } catch (e) {
                console.warn("Unable to close port");
            }
            this.port = null;
            this.grblVersion = null;
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
    handleClose(reasons) {
        console.warn("Port closed for reasons", reasons);
        this.port = null;
    }

    handleError(error) {
        console.warn("Port error", error);
    }

    queryStatus() {
        if (this.statusQueryTimer) {
            window.clearTimeout(this.statusQueryTimer);
            this.statusQueryTimer = null;
        }
        if (this.port) {
            if (!this.statusQueryInProgress) {
                this.statusQueryInProgress = true;
                console.log("Made status query");
                this.port.write("?");
            } else {
                console.error("Status query already in progress");
            }
        }
    }

    @action
    handleData(data) {
        if (!this.grblVersion) {
            let handshake = handshakeRegex.exec(data);
            if (handshake) {
                this.grblVersion = handshake[1];
                this.history.push(`Connected to grbl version ${this.grblVersion}`);
                this.queryStatus();
            } else {
                console.log("Bad data", data);
            }
        } else {
            if (data[0] === '<') {
                if (this.statusQueryInProgress && !this.statusQueryTimer) {
                    this.statusQueryInProgress = false;
                    this.statusQueryTimer = window.setTimeout(() => this.queryStatus(), 200);
                }
                grblStore.parseStatus(data);
            } else {
                console.log("Data[0] is", data[0], data.charCodeAt(0));

                this.history.push(data);
            }
            console.log("Recv:", data);
        }
    }

}


export default new ConnectionStore();

/**
 GrblMgmr is a frontend application to interface with Grbl via GrblMQTT
 Copyright (C) 2016-2017 Matti Eiden

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const storagePrefix = "grblmgmr_";

export default class StorageUtil {
    constructor() {

    }

    static get(key, def=null) {
        let value = null;
        if (window.localStorage) {
            try {
                value = JSON.parse(window.localStorage.getItem(storagePrefix + key));
            } catch (e) {
                console.warn("Unable to get localStorage key", e);
            }
        }
        return value || def;
    }

    static set(key, value) {
        if (window.localStorage) {
            try {
                window.localStorage.setItem(storagePrefix + key, JSON.stringify(value));
            } catch (e) {
                console.warn("Unable to get localStorage key", e);
            }
        }
    }
}
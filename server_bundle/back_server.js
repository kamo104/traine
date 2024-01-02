/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 613:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TimeManager = exports.CycleObject = void 0;
class CycleObject {
    get() {
        return (this.state);
    }
    set(state) {
        this.state = state;
    }
    constructor(state) {
        if (state !== undefined)
            this.state = state;
        else
            this.state = true;
    }
}
exports.CycleObject = CycleObject;
class TimeManager {
    setTime(time) {
        this.time = Number(time);
    }
    getTime() {
        return this.time;
    }
    timeAdd(amount) {
        this.setTime(this.getTime() + amount);
    }
    timePass(scope) {
        if (scope.cycle.get())
            scope.timeAdd(20 * 10000);
    }
    timeCycle() {
        setInterval(this.timePass, 10000, this);
    }
    constructor(cycleState, startingTime) {
        this.cycle = new CycleObject(cycleState);
        if (startingTime !== undefined)
            this.time = startingTime;
        else
            this.time = 1657630800000;
        this.timeCycle();
    }
}
exports.TimeManager = TimeManager;


/***/ }),

/***/ 507:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TraineConsole = void 0;
const readline = __webpack_require__(521);
class TraineConsole {
    kick() {
    }
    stop() {
    }
    players() {
    }
    locate() {
    }
    teleport() {
    }
    clear() {
    }
    help() {
    }
    consoleInit() {
        this.rl.on('line', (input) => {
            try {
                const fields = input.split(/\s+/g);
                switch (fields[0]) {
                    case ("clear"): {
                        process.stdout.write('\x1Bc');
                        break;
                    }
                    case ("exit"): {
                        console.log("Server closed!!");
                        process.exit();
                        break;
                    }
                    case ("kick"): {
                        switch (fields[1]) {
                            case ("all"): {
                                Object.entries(this.channelMap).forEach(([k, v]) => {
                                    v.socket.disconnect(true);
                                });
                                console.log("kicked all players");
                                break;
                            }
                        }
                        if (Object.keys(this.id_index).includes(fields[1])) {
                            this.channelMap[this.id_index[fields[1]]].socket.disconnect;
                            console.log("kicked player :", fields[1]);
                        }
                        else {
                            Object.entries(this.channelMap).forEach(([k, v]) => {
                                if (v.ip == fields[1]) {
                                    v.socket.disconnect;
                                }
                            });
                        }
                        break;
                    }
                    case ("locate"): {
                        switch (fields[1]) {
                            case ("all"): {
                                Object.entries(this.channelMap).forEach(([k, v]) => {
                                    console.log(v.data.position, this.id_index[k]);
                                });
                                break;
                            }
                        }
                        if (Object.keys(this.id_index).includes(fields[1])) {
                            console.log(this.channelMap[this.id_index[fields[1]]].data.position);
                        }
                        break;
                    }
                    case ("players"): {
                        console.log(Object.keys(this.id_index).length / 2);
                        Object.entries(this.channelMap).forEach(([k, v]) => {
                            console.log(this.id_index[k], ":", v.ip, ":", v.data.position);
                        });
                        break;
                    }
                    case ("stop"): {
                        console.log("Server closed!!");
                        process.exit();
                        break;
                    }
                    case ("teleport" || 0): {
                        switch (fields.length) {
                            case (5): {
                                if (Object.keys(this.id_index).includes(fields[1])) {
                                    this.channelMap[this.id_index[fields[1]]].socket.emit("teleport_request", { position: { x: fields[2], y: fields[3], z: fields[4] } });
                                }
                                break;
                            }
                            case (3): {
                                if (Object.keys(this.id_index).includes(fields[1]) && Object.keys(this.id_index).includes(fields[2])) {
                                    this.channelMap[this.id_index[fields[1]]].socket.emit("teleport_request", { position: { x: this.channelMap[this.id_index[fields[2]]].data.position.x, y: this.channelMap[this.id_index[fields[2]]].data.position.y, z: this.channelMap[this.id_index[fields[2]]].data.position.z } });
                                }
                                break;
                            }
                        }
                        break;
                    }
                    case ("time"): {
                        switch (fields[1]) {
                            case ("cycle"): {
                                switch (fields[2]) {
                                    case ("on"): {
                                        if (!this.timeManager.cycle.get()) {
                                            this.timeManager.cycle.set(true);
                                            this.server.emit("cycleChange", true);
                                            console.log("Time cycle is now on.");
                                        }
                                        else {
                                            console.log("Time cycle was already on.");
                                        }
                                        break;
                                    }
                                    case ("off"): {
                                        if (this.timeManager.cycle.get()) {
                                            this.timeManager.cycle.set(false);
                                            this.server.emit("cycleChange", false);
                                            console.log("Time cycle is now off.");
                                        }
                                        else {
                                            console.log("Time cycle was already off.");
                                        }
                                        break;
                                    }
                                }
                                break;
                            }
                            case ("display"): {
                                console.log("Current server time is: ", this.timeManager.getTime());
                                break;
                            }
                            case ("set"): {
                                this.timeManager.setTime(fields[2]);
                                this.server.emit("timeChange", Number(fields[2]));
                                console.log("Time set to: ", Number(fields[2]));
                                break;
                            }
                        }
                        break;
                    }
                    case ("help"): {
                        console.log("\n/kick [index] || all\nkicks player with a given index or all players \n" +
                            "/stop||exit \nstops the server \n" +
                            "/players \ndisplays number of connected players and lists them \n" +
                            "/locate [index] || all \nlocate the player with the given index or all \n" +
                            "/teleport||tp [i1] [x] [y] [z] || [i1] [i2]\nteleports [i1]=index player to location 1.of [x] [y] [z] 2.of a player [i2] \n" +
                            "/clear \nclears the console \n" +
                            "/help \ndisplays available commnds \n" +
                            "/time ( set [number] ) || ( cycle on || off ) || display");
                        break;
                    }
                }
            }
            catch (err) {
                console.log("improper use of command");
            }
        });
    }
    constructor(id_index, channelMap, timeManager, io) {
        this.server = io;
        this.id_index = id_index;
        this.channelMap = channelMap;
        this.timeManager = timeManager;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        this.consoleInit();
    }
}
exports.TraineConsole = TraineConsole;


/***/ }),

/***/ 270:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChannelInfo = exports.PlayerData = exports.PlayerSendInfo = exports.PlayerInfo = exports.SimpleQuaterinion = exports.SimpleVector = void 0;
class SimpleVector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
exports.SimpleVector = SimpleVector;
class SimpleQuaterinion {
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}
exports.SimpleQuaterinion = SimpleQuaterinion;
class PlayerInfo {
    constructor(model, name, dirty) {
        this.model = model;
        this.name = name;
        if (dirty)
            this.dirty = dirty;
    }
}
exports.PlayerInfo = PlayerInfo;
class PlayerSendInfo {
    constructor(id, model, name) {
        this.id = id;
        this.model = model;
        this.name = name;
    }
}
exports.PlayerSendInfo = PlayerSendInfo;
class PlayerData {
    constructor(position, rotation) {
        this.position = position;
        this.rotation = rotation;
    }
}
exports.PlayerData = PlayerData;
class ChannelInfo {
    constructor(socket, data, playerInfo, ip, connectionTime) {
        this.socket = socket;
        this.data = data;
        this.playerInfo = playerInfo;
        this.ip = ip;
        this.connectionTime = connectionTime;
    }
}
exports.ChannelInfo = ChannelInfo;


/***/ }),

/***/ 757:
/***/ ((module) => {

module.exports = require("async-mutex");

/***/ }),

/***/ 952:
/***/ ((module) => {

module.exports = require("socket.io");

/***/ }),

/***/ 147:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 685:
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ 521:
/***/ ((module) => {

module.exports = require("readline");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
const socket_io_1 = __webpack_require__(952);
var http = __webpack_require__(685);
var fs = __webpack_require__(147);
const async_mutex_1 = __webpack_require__(757);
const traine_console_1 = __webpack_require__(507);
const types_1 = __webpack_require__(270);
const time_manager_1 = __webpack_require__(613);
const httpServer = http.createServer();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
    }
});
httpServer.listen(process.env.PORT !== undefined || 3000, () => {
    console.log('listening on port: ' + (process.env.PORT !== undefined || 3000) + ' CORS: ' + "https://kamo104.github.io/");
});
var i = 0;
const id_index = {};
const channelMap = {};
const semaphore = new async_mutex_1.Semaphore(1);
function isPlayerdataValid(event) {
    if (event === undefined ||
        event.position === undefined || event.rotation === undefined ||
        event.position.x === undefined || event.position.y === undefined || event.position.z === undefined ||
        event.rotation.x === undefined || event.rotation.y === undefined || event.rotation.z === undefined ||
        isNaN(event.position.x) || isNaN(event.position.y) || isNaN(event.position.z) ||
        isNaN(event.rotation.x) || isNaN(event.rotation.y) || isNaN(event.rotation.z))
        return false;
    return true;
}
;
function isPlayerInfoValid(playerInfo) {
    if (playerInfo === undefined ||
        playerInfo.model === undefined || playerInfo.name === undefined ||
        isNaN(Number(playerInfo.model)) || 16 < String(playerInfo.name).length)
        return false;
    return true;
}
const timeManager = new time_manager_1.TimeManager(0);
const con = new traine_console_1.TraineConsole(id_index, channelMap, timeManager, io);
io.on("connection", channel => {
    async function sendCurrentPlayers() {
        const players = {};
        Object.entries(channelMap).forEach(([k, v]) => {
            if (!v.playerInfo.dirty) {
                players[id_index[k]] = v.playerInfo;
            }
        });
        io.emit("currentPlayers", players);
    }
    function addPlayerInfo(playerInfo) {
        if (!isPlayerInfoValid(playerInfo))
            channel.emit("invalidPlayerInfo");
        channelMap[channel.id].playerInfo.model = playerInfo.model;
        channelMap[channel.id].playerInfo.name = playerInfo.name;
        channelMap[channel.id].playerInfo.dirty = false;
        io.emit("player_joined", new types_1.PlayerSendInfo(Number(id_index[channel.id]), playerInfo.model, playerInfo.name), { reliable: true });
    }
    function handleTimeRequest() {
        channel.emit("timeResponse", timeManager.getTime(), { reliable: true });
    }
    function handleDayNightCycleRequest() {
        channel.emit("dayNightCycleResponse", timeManager.cycle.get(), { reliable: true });
    }
    async function handleDisconnect() {
        io.emit("player_left", id_index[channel.id]);
        console.log(channelMap[channel.id].ip, ": user left, id :", id_index[channel.id], "time of connection :", String((Date.now() - channelMap[channel.id].connectionTime) / 1000) + "s");
        delete channelMap[channel.id];
        delete id_index[id_index[channel.id]];
        delete id_index[channel.id];
    }
    async function handleUpdate(event) {
        if (isPlayerdataValid(event)) {
            const position = new types_1.SimpleVector(event.position.x, event.position.y, event.position.z);
            const rotation = new types_1.SimpleVector(event.rotation.x, event.rotation.y, event.rotation.z);
            channelMap[channel.id].data = new types_1.PlayerData(position, rotation);
        }
    }
    semaphore.runExclusive(() => {
        id_index[channel.id] = i;
        id_index[i] = channel.id;
        const ip = channel.handshake.headers["x-forwarded-for"];
        const data = new types_1.PlayerData(new types_1.SimpleVector(0, 1000, 0), new types_1.SimpleVector(0, 0, 0));
        const info = new types_1.PlayerInfo(NaN, "", true);
        channelMap[channel.id] = new types_1.ChannelInfo(channel, data, info, ip, Date.now());
        i += 1;
        channel.emit("my_id", i - 1, { reliable: true });
        console.log(channelMap[channel.id].ip, ": connected with id :", id_index[channel.id]);
    });
    channel.on("playerInfo", addPlayerInfo);
    channel.on("disconnect", handleDisconnect);
    channel.on("position_update", handleUpdate);
    channel.on("timeRequest", handleTimeRequest);
    channel.on("dayNightCycleRequest", handleDayNightCycleRequest);
    sendCurrentPlayers();
});
function distance_sq(v1, v2) {
    return ((v1.x - v2.x) * (v1.x - v2.x) + (v1.z - v2.z) * (v1.z - v2.z));
}
;
function syncPlayers() {
    const players = {};
    Object.entries(channelMap).forEach(([k, v]) => {
        players[id_index[k]] = v.playerInfo;
    });
    io.emit("syncPlayers", players);
}
setInterval(syncPlayers, 10000);
const sendUpdate = () => {
    Object.entries(channelMap).forEach(([k1, v1]) => {
        const sender = {};
        Object.entries(channelMap).forEach(([k2, v2]) => {
            if (v2.data.position && v1.data.position && k2 != k1) {
                if (75625 > distance_sq(v1.data.position, v2.data.position)) {
                    sender[id_index[k2]] = v2.data;
                }
            }
        });
        v1.socket.emit("position_data", sender);
    });
};
setInterval(sendUpdate, 100);
const sendTime = () => {
    if (timeManager.cycle.get())
        io.emit("time", timeManager.getTime());
};
setInterval(sendTime, 10000);

})();

/******/ })()
;
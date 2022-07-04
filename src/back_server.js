"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
var http = require("http");
var fs = require('fs');
const async_mutex_1 = require("async-mutex");
const traine_console_1 = require("./my_modules/traine_console");
const time_manager_1 = require("./my_modules/time_manager");
const httpServer = http.createServer();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
    },
});
httpServer.listen(3000, () => {
    console.log("listening on port: 3000");
});
var i = 0;
var id_index = {};
var channelMap = {};
const semaphore = new async_mutex_1.Semaphore(1);
function isPlayerdataValid(event) {
    if (event.position == undefined || event.rotation == undefined || event.model == undefined ||
        event.position.x == undefined || event.position.y == undefined || event.position.z == undefined ||
        event.rotation.x == undefined || event.rotation.y == undefined || event.rotation.z == undefined || event.rotation.w == undefined ||
        isNaN(event.position.x) || isNaN(event.position.y) || isNaN(event.position.z) ||
        isNaN(event.rotation.x) || isNaN(event.rotation.y) || isNaN(event.rotation.z) || isNaN(event.rotation.w) ||
        isNaN(event.model))
        return false;
    return true;
}
;
io.on("connection", channel => {
    async function handleDisconnect(event) {
        io.emit("player_left", id_index[channel.id]);
        console.log(channelMap[channel.id].ip, ": user left, id :", id_index[channel.id]);
        delete channelMap[channel.id];
        delete id_index[id_index[channel.id]];
        delete id_index[channel.id];
    }
    async function handleUpdate(event) {
        if (isPlayerdataValid(event)) {
            channelMap[channel.id].data = { position: { x: event.position.x, y: event.position.y, z: event.position.z }, rotation: { x: event.rotation.x, y: event.rotation.y, z: event.rotation.z, w: event.rotation.w }, model: event.model };
        }
    }
    semaphore.runExclusive((value) => {
        id_index[channel.id] = i;
        id_index[i] = channel.id;
        channelMap[channel.id] = { socket: channel, data: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 0 }, model: NaN }, ip: channel.handshake.headers["x-forwarded-for"] };
        i += 1;
        channel.emit("my_id", i - 1, { reliable: true, });
        console.log(channelMap[channel.id].ip, ": connected with id :", id_index[channel.id]);
    });
    channel.on("disconnect", handleDisconnect);
    channel.on("position_update", handleUpdate);
});
const timeManager = new time_manager_1.TimeManager(true);
const con = new traine_console_1.TraineConsole(id_index, channelMap, timeManager, io);
const render_distance_sq = 275 * 275;
function distance_sq(v1, v2) {
    return ((v1.x - v2.x) * (v1.x - v2.x) + (v1.z - v2.z) * (v1.z - v2.z));
}
;
const sendUpdate = () => {
    Object.entries(channelMap).forEach(([k1, v1]) => {
        let sender_lst = {};
        Object.entries(channelMap).forEach(([k2, v2]) => {
            if (v2.data.position && v1.data.position && k2 != k1) {
                if (render_distance_sq > distance_sq(v1.data.position, v2.data.position)) {
                    sender_lst[id_index[k2]] = v2.data;
                }
            }
        });
        v1.socket.emit("position_data", sender_lst);
    });
};
setInterval(sendUpdate, 100);
const sendTime = () => {
    if (timeManager.cycle.get())
        io.emit("time", timeManager.getTime());
};
setInterval(sendTime, 10000);
//# sourceMappingURL=back_server.js.map
import { Server } from "socket.io"

var http = require("http");
var fs = require('fs');
import { Semaphore } from "async-mutex"
import { TraineConsole } from "./my_modules/traine_console";

import {ChannelInfo, PlayerData, PlayerInfo ,Id_index, ChannelMap, SimpleVector, PlayerSendInfo} from "./my_types/types"
import { TimeManager } from "./my_modules/time_manager";

const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: {
      origin: "traine.servegame.com", // "traine.servegame.com"
    },
  });

httpServer.listen(3000,()=>{
	console.log("listening on port: 3000");
});


var i=0;
const id_index: Id_index = {};
const channelMap: ChannelMap = {};
const semaphore = new Semaphore(1);

function isPlayerdataValid(event){
	if(
        event===undefined||
    	event.position===undefined||event.rotation===undefined||
    	event.position.x===undefined||event.position.y===undefined||event.position.z===undefined||
    	event.rotation.x===undefined||event.rotation.y===undefined||event.rotation.z===undefined||
    	isNaN(event.position.x)||isNaN(event.position.y)||isNaN(event.position.z)||
    	isNaN(event.rotation.x)||isNaN(event.rotation.y)||isNaN(event.rotation.z)
    	) return false;
	return true;
};

function isPlayerInfoValid(playerInfo){
    if(
        playerInfo===undefined||
        playerInfo.model===undefined||playerInfo.name===undefined // ||
        // typeof(playerInfo.model)!=="number"||typeof(playerInfo.name)!=="string"||
        // isNaN(playerInfo.model)

        ) return false;
    return true;
}

const timeManager = new TimeManager(true);

const con = new TraineConsole(id_index,channelMap,timeManager, io);

io.on("connection", channel => {
    async function sendCurrentPlayers(){
        const players:{[key:number]:PlayerInfo} = {};
        Object.entries(channelMap).forEach(([k,v])=>{
            // if the given player has already sent his model and name
            if(!v.playerInfo.dirty){
                players[id_index[k]] = v.playerInfo;
            }
            
        })
        io.emit("currentPlayers", players)
    }
    function addPlayerInfo(playerInfo:PlayerInfo){
        if(!isPlayerInfoValid(playerInfo)) channel.emit("invalidPlayerInfo");

        channelMap[channel.id].playerInfo.model = playerInfo.model;
        channelMap[channel.id].playerInfo.name = playerInfo.name;
        channelMap[channel.id].playerInfo.dirty = false;
        io.emit("player_joined", new PlayerSendInfo(Number(id_index[channel.id]),playerInfo.model,playerInfo.name), {reliable:true}) // {id:id_index[channel.id],model:playerInfo.model,name:playerInfo.name}, {reliable:true});
    }

    function handleTimeRequest(){
        channel.emit("timeResponse", timeManager.getTime(),{reliable: true});
    }

    function handleDayNightCycleRequest(){
        channel.emit("dayNightCycleResponse", timeManager.cycle.get(),{reliable: true});
    }

    async function handleDisconnect(){
        io.emit("player_left",id_index[channel.id])
        console.log(channelMap[channel.id].ip, ": user left, id :", id_index[channel.id])
        //delete i and socket id
        delete channelMap[channel.id];
        delete id_index[id_index[channel.id]];
        delete id_index[channel.id];
    }
    async function handleUpdate(event){
		if(isPlayerdataValid(event)){
            const position = new SimpleVector(event.position.x,event.position.y,event.position.z);
            const rotation = new SimpleVector(event.rotation.x,event.rotation.y,event.rotation.z);
            channelMap[channel.id].data = new PlayerData(position,rotation);

			// channelMap[channel.id].data = {position:{x:event.position.x,y:event.position.y,z:event.position.z}, rotation:{x:event.rotation.x,y:event.rotation.y,z:event.rotation.z,w:event.rotation.w}};
		}
    }
    semaphore.runExclusive(()=>{
    	//remeber i and map the channel
        id_index[channel.id] =i;
        id_index[i] = channel.id;

        // when using proxy with nginx
        const ip =  channel.handshake.headers["x-forwarded-for"];
        const data = new PlayerData(new SimpleVector(0,1000,0),new SimpleVector(0,0,0));
        const info = new PlayerInfo(NaN,"",true);
        channelMap[channel.id]= new ChannelInfo(channel,data,info,ip);

        // channelMap[channel.id]={socket:channel,data:{position:{x:0,y:1000,z:0},rotation:{x:0,y:0,z:0}},ip:channel.handshake.headers["x-forwarded-for"],playerInfo:{model:NaN,name:""}};
        
        i+=1;
        channel.emit("my_id", i-1,{reliable: true});
        console.log(channelMap[channel.id].ip, ": connected with id :", id_index[channel.id]);
        
    })
    channel.on("playerInfo", addPlayerInfo);

    channel.on("disconnect",handleDisconnect);
    
    channel.on("position_update", handleUpdate);

    channel.on("timeRequest", handleTimeRequest);

    channel.on("dayNightCycleRequest", handleDayNightCycleRequest);

    sendCurrentPlayers();
})

const render_distance_sq = 275*275;

function distance_sq(v1,v2){
    return((v1.x-v2.x)*(v1.x-v2.x)+(v1.z-v2.z)*(v1.z-v2.z));
};

function syncPlayers(){
    const players:{[key:number]:PlayerInfo}={};
    Object.entries(channelMap).forEach(([k,v])=>{
        players[id_index[k]] = v.playerInfo;
    })
    io.emit("syncPlayers", players);
}

setInterval(syncPlayers, 10000);

const sendUpdate = ()=>{
    Object.entries(channelMap).forEach(([k1,v1]) => {
        let sender = {};
        Object.entries(channelMap).forEach(([k2,v2])=>{
            //if within 275 squared from player add him to working list and send socket emit
			if(v2.data.position&&v1.data.position&&k2!=k1){
				if(render_distance_sq>distance_sq(v1.data.position,v2.data.position)){
					sender[id_index[k2]] = v2.data;
				}
			}
        });
	    v1.socket.emit("position_data",sender);
    });
};

setInterval(sendUpdate,100);

const sendTime = ()=>{
    if(timeManager.cycle.get()) io.emit("time",timeManager.getTime());
};

setInterval(sendTime,10000);
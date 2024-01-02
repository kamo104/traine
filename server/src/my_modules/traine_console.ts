import {ChannelInfo, PlayerData, Id_index, ChannelMap} from "../my_types/types"
import {TimeManager} from "../my_modules/time_manager"

import { Server } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"

const readline = require('readline');

export class TraineConsole{
    server:Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    channelMap:ChannelMap;
    id_index:Id_index;
    rl:any;
    timeManager:TimeManager;
    kick(){
    }
    stop(){
    }
    players(){
    }
    locate(){
    }
    teleport(){
    }
    clear(){
    }
    help(){
    }

    consoleInit(){
        this.rl.on('line', (input) => {
            try{
                const fields = input.split(/\s+/g);
                switch(fields[0]){
                    case("clear"):{
                        //'use strict';
                        process.stdout.write('\x1Bc'); 
                        break;
                    }
                    case("exit"):{
                        console.log("Server closed!!");
                        process.exit();
                        break;
                    }
                    case("kick"):{
                        switch(fields[1]){
                            case("all"):{
                                Object.entries(this.channelMap).forEach(([k,v])=>{
                                    v.socket.disconnect(true);
                                });
                                console.log("kicked all players");
                                break;
                            }
                        }
                        if(Object.keys(this.id_index).includes(fields[1])){
                            this.channelMap[this.id_index[fields[1]]].socket.disconnect
                            
                            console.log("kicked player :", fields[1]);
                        }
                        else{
                            Object.entries(this.channelMap).forEach(([k,v])=>{
                                if(v.ip==fields[1]){
                                    v.socket.disconnect;
                                }
                            });
                        }
                        break;
                    }
                    case("locate"):{
                        switch(fields[1]){
                            case("all"):{
                            Object.entries(this.channelMap).forEach(([k,v])=>{
                                console.log(v.data.position,this.id_index[k]);
                            })
                                break;
                            }
                        }
                        if(Object.keys(this.id_index).includes(fields[1])){
                            console.log(this.channelMap[this.id_index[fields[1]]].data.position)
                        }
                        break;
                    }
                    case("players"):{
                        console.log(Object.keys(this.id_index).length/2)
                        Object.entries(this.channelMap).forEach(([k,v])=>{
                            console.log(this.id_index[k],":",v.ip,":",v.data.position)
                        });
                        break;
                    }
                    case("stop"):{
                        console.log("Server closed!!");
                        process.exit();
                        break;
                    }
                    case("teleport" || "tp"):{ //accepts i x y z as input
                        switch(fields.length){
                            case(5):{
                                if(Object.keys(this.id_index).includes(fields[1])){
                                    this.channelMap[this.id_index[fields[1]]].socket.emit("teleport_request",{position:{x:fields[2],y:fields[3],z:fields[4]}});
                                }
                                break;
                            }
                            case(3):{
                                if(Object.keys(this.id_index).includes(fields[1])&&Object.keys(this.id_index).includes(fields[2])){
                                    this.channelMap[this.id_index[fields[1]]].socket.emit("teleport_request",{position:{x:this.channelMap[this.id_index[fields[2]]].data.position.x , y:this.channelMap[this.id_index[fields[2]]].data.position.y , z:this.channelMap[this.id_index[fields[2]]].data.position.z }});
                                }
                                break;	
                            }
                        }
                        
                        break;
                    }
                    case("time"):{
                        switch(fields[1]){
                            case("cycle"):{
                                switch(fields[2]){
                                    case("on"):{
                                        if(!this.timeManager.cycle.get()){
                                            this.timeManager.cycle.set(true);
                                            this.server.emit("cycleChange",true)
                                            console.log("Time cycle is now on.");
                                        }
                                        else{
                                            console.log("Time cycle was already on.")
                                        }
                                        break;
                                    }
                                    case("off"):{
                                        if(this.timeManager.cycle.get()){
                                            this.timeManager.cycle.set(false);
                                            this.server.emit("cycleChange",false)
                                            console.log("Time cycle is now off.");
                                        }
                                        else{
                                            console.log("Time cycle was already off.")
                                        }
                                        break;
                                    }
                                }
                                break;
                            }
                            case("display"):{
                                console.log("Current server time is: ",this.timeManager.getTime());
                                break;
                            }
                            case("set"):{
                                this.timeManager.setTime(fields[2]);
                                this.server.emit("timeChange",Number(fields[2]))
                                console.log("Time set to: ", Number(fields[2]));
                                break;
                            }
                        }
                        
                        break;
                    }
                    case("help"):{
                        console.log(
                        "\n/kick [index] || all\nkicks player with a given index or all players \n" +
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
                
                
            }catch(err){
            console.log("improper use of command");
            }
        
        })
    }

    constructor(id_index,channelMap, timeManager, io){
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
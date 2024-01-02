import { Socket } from "socket.io/dist/socket";
import { DefaultEventsMap } from "socket.io/dist/typed-events"

export class SimpleVector {
    x:number;
    y:number;
    z:number;
    constructor(x:number,y:number,z:number){
        this.x=x;
        this.y=y;
        this.z=z;
    }
}

export class SimpleQuaterinion  {
    x:number;
    y:number;
    z:number;
    w:number;
    constructor(x:number,y:number,z:number,w:number){
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}


export class PlayerInfo {
    model:number;
    name:string;
    dirty:boolean;
    constructor(model:number,name:string,dirty?:boolean){
        this.model=model;
        this.name = name;
        if(dirty) this.dirty=dirty;
    }
}

export class PlayerSendInfo {
    id:number;
    model:number;
    name:string;
    constructor(id:number,model:number,name:string){
        this.id = id;
        this.model=model;
        this.name = name;
    }
}

export class PlayerData {
    position:SimpleVector;
    rotation:SimpleVector;
    constructor(position:SimpleVector,rotation:SimpleVector){
        this.position = position;
        this.rotation = rotation;
    }
}

export class ChannelInfo {
    socket:Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    data:PlayerData;
    playerInfo:PlayerInfo;
    ip:string | string[] | undefined;
    connectionTime:number;
    constructor(
        socket:Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
        data:PlayerData,
        playerInfo:PlayerInfo,
        ip:string | string[] | undefined,
        connectionTime:number
        ){
        this.socket=socket;
        this.data = data;
        this.playerInfo = playerInfo;
        this.ip = ip;
        this.connectionTime = connectionTime;
    }
}


export type Id_index = Record<string|number,number|string>;
export type ChannelMap = Record<string,ChannelInfo>;

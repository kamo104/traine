import { Socket } from "socket.io/dist/socket";
import { DefaultEventsMap } from "socket.io/dist/typed-events"

export type SimpleVector = {
    x:number;
    y:number;
    z:number;
}

export type SimpleQuaterinion = {
    x:number;
    y:number;
    z:number;
    w:number;
}

export type PlayerData = {
    position:SimpleVector;
    rotation:SimpleQuaterinion;
    model:number;
}

export type ChannelInfo = {
    socket:Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    data:PlayerData;
    ip:string | string[] | undefined;
}


export type Id_index = Record<string|number,number|string>;
export type ChannelMap = Record<string,ChannelInfo>;
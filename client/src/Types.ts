// export interface player_data {
//     position: {x:number,y:number,z:number};
//     rotation:{x:number,y:number,z:number,w:number};
//     model:number;
//     name:string;
// }

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
    constructor(model:number,name:string){
        this.model=model;
        this.name = name;
    }
}
export class PlayerSendInfo {
    id:string;
    model:number;
    name:string;
    constructor(id:string,model:number,name:string){
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


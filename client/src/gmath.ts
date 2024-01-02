//shared across all modules
import { Vector3 } from "@babylonjs/core/Maths/math"
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";


export class SimpleVector{
    x:number;
    y:number;
    z:number;
    constructor(x:number,y:number,z:number){
        this.x=x;
        this.y=y;
        this.z=z;
    }
}

export class SimpleQuaternion{
    x:number;
    y:number;
    z:number;
    w:number;
    constructor(x:number,y:number,z:number,w:number){
        this.x=x;
        this.y=y;
        this.z=z;
        this.w=w;
    }
}
// fist arg is the place in vector to sum up ex: place: "x"  sums x components of all vectors
function smartSum(place:string, args: SimpleVector[]|SimpleQuaternion[]):number{
    let sum=0;
    for(let i=0;i<args.length;i++){
        sum+=args[i][place as keyof typeof args] // ?? dont know
    }
    return(sum);
}
export function sum(...args: number[]):number{
    let sum=0;
    for(let i=0;i<args.length;i++){
        sum+=args[i]
    }
    return(sum);
}
export function positionDistanceSqrXYZ (v1, v2) {
    return( (v1.x-v2.x)*(v1.x-v2.x)+(v1.y-v2.y)*(v1.y-v2.y)+(v1.z-v2.z)*(v1.z-v2.z) );
}
export function positionDistanceSqrXZ(p1,p2){ //only xz
    return((p1.x-p2.x)*(p1.x-p2.x)+(p1.z-p2.z)*(p1.z-p2.z))
}
export function positionDistanceSqrXZVectorArray(p1,p2){ //only xz
    return((p1.x-p2[0])*(p1.x-p2[0])+(p1.z-p2[2])*(p1.z-p2[2]))
}
export function positionAverage(p1,p2){
    return({x:(p1.x+p2.x)/2,y:(p1.y+p2.y)/2,z:(p1.z+p2.z)/2})
}
export function rotationAverage(r1,r2){
    return({x:(r1.x+r2.x)/2,y:(r1.y+r2.y)/2,z:(r1.z+r2.z)/2})
}

// export function positionAverage(...args:SimpleVector[]){
//     const xsum = smartSum("x", args);
//     const ysum = smartSum("y", args);
//     const zsum = smartSum("z", args);
//     return({x:xsum/args.length,y:ysum/args.length,z:zsum/args.length});
//     // return({x:(p1.x+p2.x)/2,y:(p1.y+p2.y)/2,z:(p1.z+p2.z)/2})
// }

export function deltaPosition(p1,p2){
    return({x:p1.x-p2.x,y:p1.y-p2.y,z:p1.z-p2.z})
}
export function deltaRotation(r1,r2){
    return({x:r1.x-r2.x,y:r1.y-r2.y,z:r1.z-r2.z})
}
export function deltaQuaterion(p1,p2){
    return({x:p1.x-p2.x,y:p1.y-p2.y,z:p1.z-p2.z,w:p1.w-p2.w})
}

// export function quaternionAverage(...args:SimpleQuaternion[]){
//     const xsum = smartSum("x", args);
//     const ysum = smartSum("y", args);
//     const zsum = smartSum("z", args);
//     const wsum = smartSum("w", args);
//     return({x:xsum/args.length,y:ysum/args.length,z:zsum/args.length,w:wsum/args.length});
// }

export function quaternionAverage(p1,p2){
    return({x:(p1.x+p2.x)/2,y:(p1.y+p2.y)/2,z:(p1.z+p2.z)/2,w:(p1.w+p2.w)/2})
}
export function deltaVector(v1:Vector3,v2:Vector3){
    return(new Vector3(v1.x-v2.x,v1.y-v2.y,v1.z-v2.z));
}
export function sumVector(v1:Vector3,v2:Vector3){
    return(new Vector3(v1.x+v2.x,v1.y+v2.y,v1.z+v2.z));
}
export function normalizeXZToMaxSpeed(character:AbstractMesh,characterSpeed:number){
    var vel = character.physicsImpostor.getLinearVelocity();
    if (vel.length() > characterSpeed){
        const y = vel.y;
        vel.normalize();
        vel = new Vector3(characterSpeed*vel.x,y,characterSpeed*vel.z)
        character.physicsImpostor.setLinearVelocity(vel);
    }
}

export function cap(x:number,max:number){
    return x > max ? max : x;
}
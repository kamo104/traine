//some most common operations

import * as BABYLON from "@babylonjs/core"

export function positionDistanceSqrXYZ (v1, v2) {
    return( (v1.x-v2.x)*(v1.x-v2.x)+(v1.y-v2.y)*(v1.y-v2.y)+(v1.z-v2.z)*(v1.z-v2.z) );
}
export function positionDistanceSqrXZ(p1,p2){ //only xz
    return((p1.x-p2.x)*(p1.x-p2.x)+(p1.z-p2.z)*(p1.z-p2.z))
}
export function positionAverage(p1,p2){
    return({x:(p1.x+p2.x)/2,y:(p1.y+p2.y)/2,z:(p1.z+p2.z)/2})
}
export function deltaPosition(p1,p2){
    return({x:p1.x-p2.x,y:p1.y-p2.y,z:p1.z-p2.z})
}
export function deltaQuaterion(p1,p2){
    return({x:p1.x-p2.x,y:p1.y-p2.y,z:p1.z-p2.z,w:p1.w-p2.w})
}
export function quaternionAverage(p1,p2){
    return({x:(p1.x+p2.x)/2,y:(p1.y+p2.y)/2,z:(p1.z+p2.z)/2,w:(p1.w+p2.w)/2})
}
export function deltaVector(v1:BABYLON.Vector3,v2:BABYLON.Vector3){
    return(new BABYLON.Vector3(v1.x-v2.x,v1.y-v2.y,v1.z-v2.z));
}
export function normalizeToMaxSpeed(character:BABYLON.AbstractMesh,characterSpeed:number){
    var vel = character.physicsImpostor.getLinearVelocity();
    if (vel.length() > characterSpeed){
        vel.normalize();
        vel = new BABYLON.Vector3(characterSpeed*vel.x,characterSpeed*vel.y,characterSpeed*vel.z)
        character.physicsImpostor.setLinearVelocity(vel);
    }
}
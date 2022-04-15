//movement methods to call from controller
import * as BABYLON from "@babylonjs/core"
import * as GMATH from "../gmath"

export function driveForward(character:BABYLON.AbstractMesh){
    const massMultiplier = character.physicsImpostor.mass*10;
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new BABYLON.Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new BABYLON.Vector3(massMultiplier*Math.sin(y),0,massMultiplier*Math.cos(y));

    //default for vehicles
    character.physicsImpostor.applyForce(direction, bottom);
};
export function driveBack(character:BABYLON.AbstractMesh){
    const massMultiplier = character.physicsImpostor.mass*10;
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new BABYLON.Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new BABYLON.Vector3(massMultiplier*-Math.sin(y),0,massMultiplier*-Math.cos(y));

    //default for vehicles
    character.physicsImpostor.applyForce(direction, bottom);
};
export function driveLeft(character:BABYLON.AbstractMesh){
    const massMultiplier = character.physicsImpostor.mass*10;
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new BABYLON.Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new BABYLON.Vector3(massMultiplier*-Math.cos(y),0,massMultiplier*Math.sin(y));

    //default for vehicles
    character.physicsImpostor.applyForce(direction, bottom);
};
export function driveRight(character:BABYLON.AbstractMesh){
    const massMultiplier = character.physicsImpostor.mass*10;
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new BABYLON.Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new BABYLON.Vector3(massMultiplier*Math.cos(y),0,massMultiplier*-Math.sin(y));
    
    //default for vehicles
    character.physicsImpostor.applyForce(direction, bottom);
};
export function walkForward(character:BABYLON.AbstractMesh){
    /*
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new BABYLON.Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new BABYLON.Vector3(Math.sin(y)/15,0,Math.cos(y)/15);
    //character.moveWithCollisions(direction);
    */
    
    character.movePOV(0,0,1/15);

};
export function walkBack(character:BABYLON.AbstractMesh){
    /*
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new BABYLON.Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new BABYLON.Vector3(-Math.sin(y)/15,0,-Math.cos(y)/15);
    character.moveWithCollisions(direction);
    */
    
    character.movePOV(0,0,-1/15);

};
export function walkLeft(character:BABYLON.AbstractMesh){
    /*
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new BABYLON.Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new BABYLON.Vector3(-Math.cos(y)/15,0,Math.sin(y)/15);
    character.moveWithCollisions(direction);
    */
    
    character.movePOV(1/15,0,0);
};
export function walkRight(character:BABYLON.AbstractMesh){
    /*
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new BABYLON.Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new BABYLON.Vector3(Math.cos(y)/15,0,-Math.sin(y)/15);
    character.moveWithCollisions(direction);
    */
    
    character.movePOV(-1/15,0,0);
};
export function moveInDirection(character:BABYLON.AbstractMesh,point:BABYLON.Vector3){
    var pos = character.getAbsolutePosition();
    pos = pos.normalize();
    const p1 = point.normalize();
    var final = new BABYLON.Vector3(p1.x-pos.x,p1.y-pos.y,p1.z-pos.z)
    final = final.normalize();
    const direction = new BABYLON.Vector3(final.x/15,0,final.z/15);
    character.moveWithCollisions(direction);
};





export class movementHandler{
    character:BABYLON.AbstractMesh;
    characterSpeed:number;
    massMultiplier:number;
    pointToMove: BABYLON.Vector3;
    move:boolean;

    driveForward(){
        const center = this.character.physicsImpostor.getObjectCenter();
        const bottom = new BABYLON.Vector3(center.x,center.y - this.character.physicsImpostor.getRadius(),center.z);
        const y = this.character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new BABYLON.Vector3(this.massMultiplier*Math.sin(y),0,this.massMultiplier*Math.cos(y));
    
        //default for vehicles
        this.character.physicsImpostor.applyForce(direction, bottom);
    };
    driveBack(){
        const center = this.character.physicsImpostor.getObjectCenter();
        const bottom = new BABYLON.Vector3(center.x,center.y - this.character.physicsImpostor.getRadius(),center.z);
        const y = this.character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new BABYLON.Vector3(this.massMultiplier*-Math.sin(y),0,this.massMultiplier*-Math.cos(y));
    
        //default for vehicles
        this.character.physicsImpostor.applyForce(direction, bottom);
    };
    driveLeft(){
        const center = this.character.physicsImpostor.getObjectCenter();
        const bottom = new BABYLON.Vector3(center.x,center.y - this.character.physicsImpostor.getRadius(),center.z);
        const y = this.character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new BABYLON.Vector3(this.massMultiplier*-Math.cos(y),0,this.massMultiplier*Math.sin(y));
    
        //default for vehicles
        this.character.physicsImpostor.applyForce(direction, bottom);
    };
    driveRight(){
        const center = this.character.physicsImpostor.getObjectCenter();
        const bottom = new BABYLON.Vector3(center.x,center.y - this.character.physicsImpostor.getRadius(),center.z);
        const y = this.character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new BABYLON.Vector3(this.massMultiplier*Math.cos(y),0,this.massMultiplier*-Math.sin(y));
        
        //default for vehicles
        this.character.physicsImpostor.applyForce(direction, bottom);
    };
    walkForward(){
        /*
        const center = character.physicsImpostor.getObjectCenter();
        const bottom = new BABYLON.Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
        const y = character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new BABYLON.Vector3(Math.sin(y)/15,0,Math.cos(y)/15);
        //character.moveWithCollisions(direction);
        */
        
        this.character.movePOV(0,0,1/15);
    
    };
    walkBack(){
        /*
        const center = character.physicsImpostor.getObjectCenter();
        const bottom = new BABYLON.Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
        const y = character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new BABYLON.Vector3(-Math.sin(y)/15,0,-Math.cos(y)/15);
        character.moveWithCollisions(direction);
        */
        
        this.character.movePOV(0,0,-1/15);
    
    };
    walkLeft(){
        /*
        const center = character.physicsImpostor.getObjectCenter();
        const bottom = new BABYLON.Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
        const y = character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new BABYLON.Vector3(-Math.cos(y)/15,0,Math.sin(y)/15);
        character.moveWithCollisions(direction);
        */
        
        this.character.movePOV(1/15,0,0);
    };
    walkRight(){
        /*
        const center = character.physicsImpostor.getObjectCenter();
        const bottom = new BABYLON.Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
        const y = character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new BABYLON.Vector3(Math.cos(y)/15,0,-Math.sin(y)/15);
        character.moveWithCollisions(direction);
        */
        
        this.character.movePOV(-1/15,0,0);
    };
    moveInDirection(point:BABYLON.Vector3){
        var pos = this.character.absolutePosition;
        pos = pos.normalize();
        const p1 = point.normalize();
        //var final = GMATH.deltaVector(point,this.character.absolutePosition);
        var final = GMATH.deltaVector(p1,pos);

        final = final.normalize();
        const direction = new BABYLON.Vector3(final.x,0.1,final.z); // /15
        this.character.moveWithCollisions(direction);
    };

    constructor(character:BABYLON.AbstractMesh,characterSpeed:number,massMultiplier:number){
        this.character = character;
        this.characterSpeed = characterSpeed;
        this.massMultiplier = massMultiplier;
        this.pointToMove = this.character.absolutePosition;
        this.move = false;
    }
}
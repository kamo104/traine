//gmath module
import * as GMATH from "../gmath"

//shared across all modules
import { Vector3 } from "@babylonjs/core/Maths/math";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

export function driveForward(character:AbstractMesh){
    const massMultiplier = character.physicsImpostor.mass*10;
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new Vector3(massMultiplier*Math.sin(y),0,massMultiplier*Math.cos(y));

    //default for vehicles
    character.physicsImpostor.applyForce(direction, bottom);
};
export function driveBack(character:AbstractMesh){
    const massMultiplier = character.physicsImpostor.mass*10;
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new Vector3(massMultiplier*-Math.sin(y),0,massMultiplier*-Math.cos(y));

    //default for vehicles
    character.physicsImpostor.applyForce(direction, bottom);
};
export function driveLeft(character:AbstractMesh){
    const massMultiplier = character.physicsImpostor.mass*10;
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new Vector3(massMultiplier*-Math.cos(y),0,massMultiplier*Math.sin(y));

    //default for vehicles
    character.physicsImpostor.applyForce(direction, bottom);
};
export function driveRight(character:AbstractMesh){
    const massMultiplier = character.physicsImpostor.mass*10;
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new Vector3(massMultiplier*Math.cos(y),0,massMultiplier*-Math.sin(y));
    
    //default for vehicles
    character.physicsImpostor.applyForce(direction, bottom);
};
export function walkForward(character:AbstractMesh){
    /*
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new Vector3(Math.sin(y)/15,0,Math.cos(y)/15);
    //character.moveWithCollisions(direction);
    */
    
    character.movePOV(0,0,1/15);

};
export function walkBack(character:AbstractMesh){
    /*
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new Vector3(-Math.sin(y)/15,0,-Math.cos(y)/15);
    character.moveWithCollisions(direction);
    */
    
    character.movePOV(0,0,-1/15);

};
export function walkLeft(character:AbstractMesh){
    /*
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new Vector3(-Math.cos(y)/15,0,Math.sin(y)/15);
    character.moveWithCollisions(direction);
    */
    
    character.movePOV(1/15,0,0);
};
export function walkRight(character:AbstractMesh){
    /*
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new Vector3(Math.cos(y)/15,0,-Math.sin(y)/15);
    character.moveWithCollisions(direction);
    */
    
    character.movePOV(-1/15,0,0);
};
export function moveInDirection(character:AbstractMesh,point:Vector3){
    var pos = character.getAbsolutePosition();
    pos = pos.normalize();
    const p1 = point.normalize();
    var final = new Vector3(p1.x-pos.x,p1.y-pos.y,p1.z-pos.z)
    final = final.normalize();
    const direction = new Vector3(final.x/15,0,final.z/15);
    character.moveWithCollisions(direction);
};





export class movementHandler{
    character:AbstractMesh;
    characterSpeed:number;
    massMultiplier:number;
    pointToMove: Vector3;
    move:boolean;

    driveForward(){
        const center = this.character.physicsImpostor.getObjectCenter();
        const bottom = new Vector3(center.x,center.y - this.character.physicsImpostor.getRadius(),center.z);
        const y = this.character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new Vector3(this.massMultiplier*Math.sin(y),0,this.massMultiplier*Math.cos(y));
    
        //default for vehicles
        this.character.physicsImpostor.applyForce(direction, bottom);
    };
    driveBack(){
        const center = this.character.physicsImpostor.getObjectCenter();
        const bottom = new Vector3(center.x,center.y - this.character.physicsImpostor.getRadius(),center.z);
        const y = this.character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new Vector3(this.massMultiplier*-Math.sin(y),0,this.massMultiplier*-Math.cos(y));
    
        //default for vehicles
        this.character.physicsImpostor.applyForce(direction, bottom);
    };
    driveLeft(){
        const center = this.character.physicsImpostor.getObjectCenter();
        const bottom = new Vector3(center.x,center.y - this.character.physicsImpostor.getRadius(),center.z);
        const y = this.character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new Vector3(this.massMultiplier*-Math.cos(y),0,this.massMultiplier*Math.sin(y));
    
        //default for vehicles
        this.character.physicsImpostor.applyForce(direction, bottom);
    };
    driveRight(){
        const center = this.character.physicsImpostor.getObjectCenter();
        const bottom = new Vector3(center.x,center.y - this.character.physicsImpostor.getRadius(),center.z);
        const y = this.character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new Vector3(this.massMultiplier*Math.cos(y),0,this.massMultiplier*-Math.sin(y));
        
        //default for vehicles
        this.character.physicsImpostor.applyForce(direction, bottom);
    };
    walkForward(){
        /*
        const center = character.physicsImpostor.getObjectCenter();
        const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
        const y = character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new Vector3(Math.sin(y)/15,0,Math.cos(y)/15);
        //character.moveWithCollisions(direction);
        */
        
        this.character.movePOV(0,0,1/15);
    
    };
    walkBack(){
        /*
        const center = character.physicsImpostor.getObjectCenter();
        const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
        const y = character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new Vector3(-Math.sin(y)/15,0,-Math.cos(y)/15);
        character.moveWithCollisions(direction);
        */
        
        this.character.movePOV(0,0,-1/15);
    
    };
    walkLeft(){
        /*
        const center = character.physicsImpostor.getObjectCenter();
        const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
        const y = character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new Vector3(-Math.cos(y)/15,0,Math.sin(y)/15);
        character.moveWithCollisions(direction);
        */
        
        this.character.movePOV(1/15,0,0);
    };
    walkRight(){
        /*
        const center = character.physicsImpostor.getObjectCenter();
        const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
        const y = character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new Vector3(Math.cos(y)/15,0,-Math.sin(y)/15);
        character.moveWithCollisions(direction);
        */
        
        this.character.movePOV(-1/15,0,0);
    };
    moveInDirection(point:Vector3){
        var pos = this.character.absolutePosition;
        pos = pos.normalize();
        const p1 = point.normalize();
        //var final = GMATH.deltaVector(point,this.character.absolutePosition);
        var final = GMATH.deltaVector(p1,pos);

        final = final.normalize();
        const direction = new Vector3(final.x,0.1,final.z); // /15
        this.character.moveWithCollisions(direction);
    };

    constructor(character:AbstractMesh,characterSpeed:number,massMultiplier:number){
        this.character = character;
        this.characterSpeed = characterSpeed;
        this.massMultiplier = massMultiplier;
        this.pointToMove = this.character.absolutePosition;
        this.move = false;
    }
}
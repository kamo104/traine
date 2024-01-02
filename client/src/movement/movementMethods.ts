//gmath module
import * as GMATH from "../gmath"

//shared across all modules
import { Vector3 } from "@babylonjs/core/Maths/math";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Matrix } from "@babylonjs/core/Maths/math"
import { Axis } from "@babylonjs/core/Maths/math";


export function driveForward(character:AbstractMesh){
    const mass = character.physicsImpostor.mass*10;
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new Vector3(mass*Math.sin(y),0,mass*Math.cos(y));

    //default for vehicles
    character.physicsImpostor.applyForce(direction, bottom);
};
export function driveBack(character:AbstractMesh){
    const mass = character.physicsImpostor.mass*10;
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new Vector3(mass*-Math.sin(y),0,mass*-Math.cos(y));

    //default for vehicles
    character.physicsImpostor.applyForce(direction, bottom);
};
export function driveLeft(character:AbstractMesh){
    const mass = character.physicsImpostor.mass*10;
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new Vector3(mass*-Math.cos(y),0,mass*Math.sin(y));

    //default for vehicles
    character.physicsImpostor.applyForce(direction, bottom);
};
export function driveRight(character:AbstractMesh){
    const mass = character.physicsImpostor.mass*10;
    const center = character.physicsImpostor.getObjectCenter();
    const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
    const y = character.absoluteRotationQuaternion.toEulerAngles().y;
    const direction = new Vector3(mass*Math.cos(y),0,mass*-Math.sin(y));
    
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
    mass:number;
    pointToMove: Vector3;
    move:boolean;
    velocity:Vector3;

    driveForward(amount:number){
        const center = this.character.physicsImpostor.getObjectCenter();
        const bottom = new Vector3(center.x,center.y - this.character.physicsImpostor.getRadius(),center.z);
        const y = this.character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new Vector3(this.mass*Math.sin(y),0,this.mass*Math.cos(y));
    
        //default for vehicles
        this.character.physicsImpostor.applyForce(direction, bottom);
    };
    driveBack(amount:number){
        const center = this.character.physicsImpostor.getObjectCenter();
        const bottom = new Vector3(center.x,center.y - this.character.physicsImpostor.getRadius(),center.z);
        const y = this.character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new Vector3(this.mass*-Math.sin(y),0,this.mass*-Math.cos(y));
    
        //default for vehicles
        this.character.physicsImpostor.applyForce(direction, bottom);
    };
    driveLeft(amount:number){
        const center = this.character.physicsImpostor.getObjectCenter();
        const bottom = new Vector3(center.x,center.y - this.character.physicsImpostor.getRadius(),center.z);
        const y = this.character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new Vector3(this.mass*-Math.cos(y),0,this.mass*Math.sin(y));
    
        //default for vehicles
        this.character.physicsImpostor.applyForce(direction, bottom);
    };
    driveRight(amount:number){
        const center = this.character.physicsImpostor.getObjectCenter();
        const bottom = new Vector3(center.x,center.y - this.character.physicsImpostor.getRadius(),center.z);
        const y = this.character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new Vector3(this.mass*Math.cos(y),1,this.mass*-Math.sin(y));
        
        //default for vehicles
        this.character.physicsImpostor.applyForce(direction, bottom);
    };
    walkForward(amount:number){
        
        //const center = this.character.physicsImpostor.getObjectCenter();
        //const bottom = new Vector3(center.x,center.y - this.character.physicsImpostor.getRadius(),center.z);
        //const y = this.character.absoluteRotationQuaternion.toEulerAngles().y;
        //const direction = new Vector3(Math.sin(y),0,Math.cos(y));
        //this.character.moveWithCollisions(direction);
        
        this.character.movePOV(0,0,amount*1/15);
    
    };
    walkBack(amount:number){
        /*
        const center = character.physicsImpostor.getObjectCenter();
        const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
        const y = character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new Vector3(-Math.sin(y)/15,0,-Math.cos(y)/15);
        character.moveWithCollisions(direction);
        */
        
        this.character.movePOV(0,0,amount*-1/15);
    
    };
    walkLeft(amount:number){
        /*
        const center = character.physicsImpostor.getObjectCenter();
        const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
        const y = character.absoluteRotationQuaternion.toEulerAngles().y;
        const direction = new Vector3(-Math.cos(y)/15,0,Math.sin(y)/15);
        character.moveWithCollisions(direction);
        */
        
        this.character.movePOV(amount*1/15,0,0);
    };
    walkRight(amount:number){
        
        //const center = this.character.physicsImpostor.getObjectCenter();
        //const bottom = new Vector3(center.x,center.y - character.physicsImpostor.getRadius(),center.z);
        //const y = this.character.absoluteRotationQuaternion.toEulerAngles().y;
        //const direction = new Vector3(Math.cos(y)/15,0,-Math.sin(y)/15);
        //this.character.moveWithCollisions(direction);

        this.character.movePOV(amount*-1/15,0,0);
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
    walk(
        dirs:[
            /*"forward":*/number,
            /*"back":*/number,
            /*"left":*/number,
            /*"right":*/number],
        amount:number){
        const direction:Vector3=new Vector3(0,0,0);
        //let velocity:Vector3=new Vector3(0,0,0);
        direction.x = -(dirs[0] - dirs[1]);
        direction.z = -(dirs[3] - dirs[2]);
        direction.normalize();

        this.velocity.x = 0;
        this.velocity.z = 0;
        if (dirs[3] || dirs[2]) this.velocity.z = direction.z * amount*66/600;
        if (dirs[0] || dirs[1]) this.velocity.x = direction.x * amount*66/600;
        
        const viewAngleY = this.character.rotationQuaternion.toEulerAngles().y+3*Math.PI/2 ;
        const rotationAxis = Matrix.RotationAxis(Axis.Y, viewAngleY);
        
        const rotatedVelocity = Vector3.TransformCoordinates(this.velocity.multiplyByFloats(1, Math.floor(amount*66/10), 1), rotationAxis);
        this.character.physicsImpostor.setAngularVelocity(new Vector3(0,0,0));
        if (this.velocity.z !== 0 || this.velocity.x !== 0) {
            this.character.physicsImpostor.wakeUp();
            const old = this.character.physicsImpostor.getLinearVelocity();
            old.x = 0;
            old.z = 0;
            
            const add = old.add(rotatedVelocity.scale(amount*this.characterSpeed*3/4))
            this.character.physicsImpostor.setLinearVelocity(add);

        }
        else {
            //if (onObject) this.character.physicsImpostor.sleep();
            const old = this.character.physicsImpostor.getLinearVelocity();
            old.x = 0;
            old.z = 0;
            this.character.physicsImpostor.setLinearVelocity(old);

        } 
    }
    jump(animationRatio:number){
        const center = this.character.physicsImpostor.getObjectCenter();
        const bottom = new Vector3(center.x,center.y - this.character.physicsImpostor.getRadius(),center.z);
        const direction = new Vector3(0,this.character.physicsImpostor.mass*10*40*animationRatio,0);

        this.character.physicsImpostor.applyForce(direction, bottom);
    }
    constructor(character:AbstractMesh,characterSpeed:number,mass:number){
        this.character = character;
        this.characterSpeed = characterSpeed;
        this.mass = mass;
        this.pointToMove = this.character.absolutePosition;
        this.move = false;
        this.velocity = new Vector3();
    }
}
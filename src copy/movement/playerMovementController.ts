//shared across all modules
import { Scene } from "@babylonjs/core/scene";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Vector3 } from "@babylonjs/core/Maths/math";

//camera module
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";

//unique
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { Ray } from "@babylonjs/core/Culling/ray";
import { Observer } from "@babylonjs/core/Misc/observable";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { ICameraInput } from "@babylonjs/core/Cameras/index";

//gmath module
import * as GMATH from "../gmath"

//movement methods to call from controller
import * as MOVEMENT from "./movementMethods"

export class Controller{
    
    private scene: Scene;

    //private pointToMove:Vector3;
    //player character 
    character: AbstractMesh;
    characterSpeed: number;
    private startingCameraRotation: number;
    private camera: ArcRotateCamera;
    private movementHandler: MOVEMENT.movementHandler;
    private inputMap: {};

    private update_camera(){
        this.camera.target =this.character.getChildMeshes()[0].getAbsolutePosition()

        //-this.startingCameraRotation from alpha
        var newRotation = (2*Math.PI)*Math.floor((this.camera.alpha-this.startingCameraRotation)/(2*Math.PI)) -(this.camera.alpha-this.startingCameraRotation);
        var newVector = this.character.rotationQuaternion.toEulerAngles()
        newVector.y = newRotation;
        newVector.x = 0;
        newVector.z = 0;

        this.scene.onPointerDown
        //update_character rotation based on camera alpha
        this.character.rotationQuaternion = newVector.toQuaternion();
    }
    private player_input(){
        //var massMultiplier:number;
        var isJumping: boolean = false;
        //let jumpKeyDown = false;

        var ray:Ray;
        var hit:PickingInfo;
        const predicate = ((mesh:AbstractMesh)=>{
            if(mesh==this.character){return(false)}
            return(true);
        })
        //jumping ray
        this.scene.registerBeforeRender(()=> {
            //pick from a higher up position to avoid negative results
            const pos = this.character.absolutePosition;
            pos.y+=1;
            ray = new Ray(pos, new Vector3(0,-1,0), 100);
            hit = this.scene.pickWithRay(ray,predicate);
            if (hit.distance<1.01){
                isJumping = false;
            }
            else{
                // ?? add terrain check (if climbing sloped terrain allow for )
                pos.y-=1;
                ray = new Ray(pos, new Vector3(0,0,1), 10);
                const hit2 = this.scene.pickWithRay(ray,predicate);
                
                if (hit2.distance<1.01 && hit2.distance>0){ // ?? not hit distance but angle from picked point to bottom point
                    //isJumping = false;
                }
                else{
                    isJumping = true;
                }
                // ?? add terrain check (if climbing sloped terrain allow for )                
            }
        })    
        const jump = (()=>{
            const center = this.character.physicsImpostor.getObjectCenter();
            const bottom = new Vector3(center.x,center.y - this.character.physicsImpostor.getRadius(),center.z);
            const direction = new Vector3(0,this.character.physicsImpostor.mass*10*40,0);

            //default for vehicles
            this.character.physicsImpostor.applyForce(direction, bottom);
        })
        this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt)=> {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
            if (evt.sourceEvent.type == "keydown" && evt.sourceEvent.code == "Space" && !isJumping) {
                jump();
                isJumping = true;
            }
        }));
        this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt)=>{
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));


        var state:string;
        state = "walking";
        //movement mapping
        this.scene.onBeforeRenderObservable.add(()=> {
                    switch(state){
                        case("walking"):{
                            if(this.inputMap["w"]){
                                this.movementHandler.walkForward();
                            } 
                            if(this.inputMap["a"]){
                                this.movementHandler.walkLeft();
                            } 
                            if(this.inputMap["s"]){
                                this.movementHandler.walkBack();
                            } 
                            if(this.inputMap["d"]){
                                this.movementHandler.walkRight();
                            }
                            break;
                        }
                        case("driving"):{
                            if(this.inputMap["w"]){
                                this.movementHandler.driveForward();
                            } 
                            if(this.inputMap["a"]){
                                this.movementHandler.driveLeft();
                            } 
                            if(this.inputMap["s"]){
                                this.movementHandler.driveBack();
                            } 
                            if(this.inputMap["d"]){
                                this.movementHandler.driveRight();
                            }
                            break;
                        }
                    }
                    this.update_camera();
                    GMATH.normalizeToMaxSpeed(this.character,this.characterSpeed);
                    
            }
        );
        
    }
    addMobileMovement(){
        //mobile movement
        //var move=false;
        var lastTimestamp:number =-501;
        var lastTouch:Touch;
        var observer:Observer<Scene>;
        const grzymInput = (event:TouchEvent) =>{
            if(event.timeStamp-lastTimestamp<500 && event.timeStamp-lastTimestamp > 50){
                var dx = event.changedTouches[0].clientX-lastTouch.clientX;
                var dy = event.changedTouches[0].clientY-lastTouch.clientY;
                if(dx*dx+dy*dy<100){
                    this.movementHandler.move=true;
                    
                    var pickResult = this.scene.pick(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                    this.movementHandler.pointToMove = pickResult.pickedPoint;

                }
            }
            lastTouch = event.changedTouches[0];
            lastTimestamp=event.timeStamp
        };
        const touch_input:ICameraInput<ArcRotateCamera> = {
            camera:this.camera,
            getClassName: ()=>{
                return "grzymCam"
            },
            getSimpleName: ()=>{
                return "grzymInput"
            },
            attachControl: ()=>{
                this.movementHandler.move=false;
                window.addEventListener("touchstart", grzymInput)
                observer = this.scene.onBeforeRenderObservable.add(()=>{
                    if(GMATH.positionDistanceSqrXYZ(this.character.getAbsolutePosition(),this.movementHandler.pointToMove)<0.1){
                        this.movementHandler.move=false;
                    } //is around 1 unit from picked position, this.move = false;
                    else if(this.movementHandler.move){
                        this.movementHandler.moveInDirection(this.movementHandler.pointToMove);
                    }
                })
            },
            detachControl: ()=>{
                window.removeEventListener("touchstart", grzymInput)
                this.scene.onBeforeRenderObservable.remove(observer)
            },
        }
        this.camera.inputs.add(touch_input)
    }

    constructor(scene: Scene, camera:ArcRotateCamera, character: AbstractMesh, characterSpeed: number ) {
        this.scene = scene;
        this.character = character;
        camera.target = this.character.getChildMeshes()[0].absolutePosition;
        camera.beta = Math.PI/3;
        camera.alpha = this.character.rotationQuaternion.toEulerAngles().y+Math.PI*1/2;
        this.camera = camera;
        this.startingCameraRotation = camera.alpha;
        this.characterSpeed = characterSpeed;
        this.movementHandler = new MOVEMENT.movementHandler(this.character,this.characterSpeed,this.character.physicsImpostor.mass*10);
        this.scene.actionManager = new ActionManager(this.scene);
        this.inputMap = {};
        this.player_input();
        this.addMobileMovement();
        };
};


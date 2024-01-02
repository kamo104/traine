//shared across all modules
import { Scene } from "@babylonjs/core/scene";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math";

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

// game constants and variables
import {constants} from "../constants";
import {variables} from "../variables";
import {keyBindings} from "../keyBindings";

export class Controller{
    
    private scene: Scene;

    //private pointToMove:Vector3;
    //player character 
    character: AbstractMesh;
    state:string = "walking";
    characterSpeed: number;
    private startingCameraRotation: number;
    private camera: ArcRotateCamera;
    private movementHandler: MOVEMENT.movementHandler;
    private inputMap: {};

    private update_camera(){
        this.camera.target =this.character.getChildMeshes()[0].getAbsolutePosition()

        //-this.startingCameraRotation from alpha
        var newRotation = (2*Math.PI)*Math.floor((this.camera.alpha-this.startingCameraRotation)/(2*Math.PI)) -(this.camera.alpha-this.startingCameraRotation);
        var newVector = new Vector3(0,newRotation,0);// = this.character.rotationQuaternion.toEulerAngles()


        //this.scene.onPointerDown
        //update_character rotation based on camera alpha

        this.character.rotationQuaternion = newVector.toQuaternion();
    }
    private player_input(){
        //var massMultiplier:number;
        var isJumping: boolean = false;
        const jumpTreshold = 0.1;

        var ray:Ray;
        var hit:PickingInfo;

        // prevents picking the character himself
        const predicate = ((mesh:AbstractMesh)=>{
            if(mesh.id == this.character.id || mesh.parent?.id == this.character.id/*mesh.name=="head"*/)return(false);
            return(true);
        })
        //rays used to check whether a player is under the map and if is jumping
        this.scene.registerBeforeRender(()=> {
            // TO OPTIMIZE, IS TAKING A LOT OF TIME TO PICK WITH RAYS

            // // VERSION 2

            const pos = this.character.absolutePosition;
            const rayDown = new Ray(pos, new Vector3(0,-1,0), 100);
            const hitDown = this.scene.pickWithRay(rayDown,predicate);

            if(hitDown.hit===false){
                isJumping = true;

                // get him up to the surface if he fell
                const rayUp = new Ray(pos, new Vector3(0,1,0), 100);
                const hitUp = this.scene.pickWithRay(rayUp,predicate);

                if(hitUp.hit==false) return; // he's out of the map

                if(hitUp.pickedMesh.name.substring(0,constants.MAP_NAME.length)===constants.MAP_NAME)
                this.character.setAbsolutePosition(pos.add(new Vector3(0,hitUp.pickedPoint.y-pos.y,0)));
                return;
            }

            const diff = pos.y - hitDown.pickedPoint.y;
            if(diff>jumpTreshold) isJumping = true;
            else isJumping = false;


        })

        this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt)=> {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
            if (evt.sourceEvent.type == "keydown" && evt.sourceEvent.code == keyBindings.JUMP && !isJumping) {
                this.movementHandler.jump(this.scene.getAnimationRatio());
            }
        }));
        this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt)=>{
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        // marks movement based on keyboard input
        const markMovement = (dirs:[number,number,number,number])=>{
            if(this.inputMap[keyBindings.FORWARD]) dirs[0] = 1;
            if(this.inputMap[keyBindings.BACK]) dirs[1] = 1;
            if(this.inputMap[keyBindings.LEFT]) dirs[2] = 1;
            if(this.inputMap[keyBindings.RIGHT]) dirs[3] = 1;

            if(this.inputMap[keyBindings.SPRINT]) this.state = "running";
            else this.state = "walking";
        }

        //movement mapping
        var dirs:[/*"forward":*/number,
            /*"back":*/number,
            /*"left":*/number,
            /*"right":*/number] = [0,0,0,0];

        this.scene.onBeforeRenderObservable.add(()=> {
            dirs.fill(0,0,4);
            
            switch(this.state){
                case("walking"):{
                    markMovement(dirs);
                    this.movementHandler.walk(dirs,this.scene.getAnimationRatio()*1.5)
                    break;
                }
                case("running"):{
                    markMovement(dirs);
                    this.movementHandler.walk(dirs,this.scene.getAnimationRatio()*2)
                    break;
                }
                case("driving"):{
                    if(this.inputMap[keyBindings.FORWARD]){
                        this.movementHandler.driveForward(this.scene.getAnimationRatio());
                    } 
                    if(this.inputMap[keyBindings.LEFT]){
                        this.movementHandler.driveLeft(this.scene.getAnimationRatio());
                    } 
                    if(this.inputMap[keyBindings.BACK]){
                        this.movementHandler.driveBack(this.scene.getAnimationRatio());
                    } 
                    if(this.inputMap[keyBindings.RIGHT]){
                        this.movementHandler.driveRight(this.scene.getAnimationRatio());
                    }
                    break;
                }
            }
            this.update_camera();
            GMATH.normalizeXZToMaxSpeed(this.character,this.characterSpeed);
            }// ,undefined,true
        );
        // this.scene.onBeforeCameraRenderObservable.add(()=>{
        //     this.update_camera();
        // },undefined,true);
        
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
        if(this.character.rotationQuaternion) camera.alpha = this.character.rotationQuaternion.toEulerAngles().y+Math.PI*1/2;
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


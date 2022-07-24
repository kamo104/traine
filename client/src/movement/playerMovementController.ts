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

export class Controller{
    
    private scene: Scene;

    //private pointToMove:Vector3;
    //player character 
    character: AbstractMesh;
    state:string;
    characterSpeed: number;
    private startingCameraRotation: number;
    private camera: ArcRotateCamera;
    private movementHandler: MOVEMENT.movementHandler;
    private inputMap: {};

    private update_camera(){
        this.camera.target =this.character.getChildMeshes()[0].getAbsolutePosition()

        //-this.startingCameraRotation from alpha
        let newRotation = (2*Math.PI)*Math.floor((this.camera.alpha-this.startingCameraRotation)/(2*Math.PI)) -(this.camera.alpha-this.startingCameraRotation);
        let newVector = new Vector3(0,newRotation,0);// = this.character.rotationQuaternion.toEulerAngles()


        //this.scene.onPointerDown
        //update_character rotation based on camera alpha

        this.character.rotationQuaternion = newVector.toQuaternion();
    }
    private player_input(){
        //var massMultiplier:number;
        var isJumping: boolean = false;
        const jumpTreshold = 0.1;
        //let jumpKeyDown = false;

        var ray:Ray;
        var hit:PickingInfo;
        const predicate = ((mesh:AbstractMesh)=>{
            if(mesh==this.character||mesh.name=="head"){return(false)}
            return(true);
        })
        //rays used to check whether a player is under the map and if is jumping
        this.scene.registerBeforeRender(()=> {
            //pick from a higher up position to avoid negative results
            const pos = this.character.absolutePosition;
            pos.y+=1;
            ray = new Ray(pos, new Vector3(0,-1,0), 100);
            hit = this.scene.pickWithRay(ray,predicate);
            

            //if he's under the map, tp him to the top
            const rayUp = new Ray(pos, new Vector3(0,1,0),100);
            const hitUp = this.scene.pickWithRay(rayUp,predicate);
            if(hitUp.pickedMesh && hitUp.pickedMesh.name.substring(0,2)=="eu") this.character.position = hitUp.pickedPoint;

            if (hit.distance<1+jumpTreshold){
                isJumping = false;
            }
            else{
                
                // ?? add terrain check (if climbing sloped terrain allow for )
                pos.y-=1;
                ray = new Ray(pos, new Vector3(0,0,1), 10);
                const hit2 = this.scene.pickWithRay(ray,predicate);
                
                if (hit2.distance<1+jumpTreshold && hit2.distance>0){ // ?? not hit distance but angle from picked point to bottom point
                    //isJumping = false;
                }
                else{
                    isJumping = true;
                }
                // ?? add terrain check (if climbing sloped terrain allow for )                
            }
        })

        this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt)=> {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
            if (evt.sourceEvent.type == "keydown" && evt.sourceEvent.code == "Space" && !isJumping) {
                this.movementHandler.jump(this.scene.getAnimationRatio());
                isJumping = true;
            }
        }));
        this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt)=>{
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));


        this.state = "walking";
        //movement mapping
        let w:number=0,a:number=0,s:number=0,d:number=0;
        this.scene.onBeforeRenderObservable.add(()=> {
            w=0,a=0,s=0,d=0;
            if(this.inputMap["Shift"]) this.state = "running";
            else this.state = "walking";
            switch(this.state){
                case("walking"):{
                    if(this.inputMap["w"]){
                        w=1;
                        //this.movementHandler.walkForward(this.scene.getAnimationRatio());
                    }
                    if(this.inputMap["a"]){
                        a=1;
                        //this.movementHandler.walkLeft(this.scene.getAnimationRatio());
                    } 
                    if(this.inputMap["s"]){
                        s=1;
                        //this.movementHandler.walkBack(this.scene.getAnimationRatio());
                    } 
                    if(this.inputMap["d"]){
                        d=1;
                        //this.movementHandler.walkRight(this.scene.getAnimationRatio());
                    }
                    this.movementHandler.walk({"forward":w,"back":s,"left":a,"right":d},this.scene.getAnimationRatio()*1.5)
                    break;
                }
                case("running"):{
                    
                    if(this.inputMap["w"]){
                        w=1;
                        //this.movementHandler.walkForward(this.scene.getAnimationRatio()*2);
                    }
                    if(this.inputMap["a"]){
                        a=1;
                        //this.movementHandler.walkLeft(this.scene.getAnimationRatio()*2);
                    } 
                    if(this.inputMap["s"]){
                        s=1;
                        //this.movementHandler.walkBack(this.scene.getAnimationRatio()*2);
                    } 
                    if(this.inputMap["d"]){
                        d=1;
                        //this.movementHandler.walkRight(this.scene.getAnimationRatio()*2);
                    }
                    this.movementHandler.walk({"forward":w,"back":s,"left":a,"right":d},this.scene.getAnimationRatio()*2)
                    break;
                }
                case("driving"):{
                    if(this.inputMap["w"]){
                        this.movementHandler.driveForward(this.scene.getAnimationRatio());
                    } 
                    if(this.inputMap["a"]){
                        this.movementHandler.driveLeft(this.scene.getAnimationRatio());
                    } 
                    if(this.inputMap["s"]){
                        this.movementHandler.driveBack(this.scene.getAnimationRatio());
                    } 
                    if(this.inputMap["d"]){
                        this.movementHandler.driveRight(this.scene.getAnimationRatio());
                    }
                    break;
                }
            }
            this.update_camera();
            GMATH.normalizeXZToMaxSpeed(this.character,this.characterSpeed);
                    
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


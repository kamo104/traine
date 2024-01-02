//shared across all modules
import { Scene } from "@babylonjs/core/scene"
import { AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh"
import { Vector3,Color3,Color4} from "@babylonjs/core/Maths/math"

//assets Module
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager"
import "@babylonjs/loaders/OBJ/objFileLoader"
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"
import { Mesh } from "@babylonjs/core/Meshes/mesh"

//shadows module
import { CascadedShadowGenerator } from "@babylonjs/core/Lights/Shadows/cascadedShadowGenerator"
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent"

//physics
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor"
import "@babylonjs/core/Collisions/collisionCoordinator";

import { AmmoJSPlugin } from "@babylonjs/core/Physics"
//import  Ammo  from 'ammo.js'
import Ammo  from "ammojs-typed"
//import { CannonJSPlugin } from "@babylonjs/core"
//import * as CANNON from "cannon-es"
//window.CANNON = CANNON;

//camera module
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera"

//materials module
import { SkyMaterial } from "@babylonjs/materials/sky/skyMaterial"

//sun position algorithm
import * as SUNCALC from "suncalc";

//lights
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight"
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight"

//fog color based on facing direction
import {ReflectionProbe} from "@babylonjs/core/Probes/reflectionProbe"

//custom controller
import {Controller} from "./movement/playerMovementController";

//multiplayerController
import {MPController} from "./multiplayer/multiplayer"

//dynamicMap
import { BasicMap } from "./map/basicMap";
import {DynamicMap} from "./map/map"

//GUI
import {Gui, GameGui} from "./gui/gui";

//timeManager
import { TimeManager } from "./timeManager/time_manager"

import * as GMATH from "./gmath" 
import { PlayerInfo } from "./Types"

// game constants and variables
import {constants} from "./constants";
import {variables} from "./variables";
import { keyBindings } from "./keyBindings"

// 0 +x (right) 225-270-315 : 5,6
// 1 -x (left) 45-90-135 : 1,2
// 5 +z (back) 135-180-225 : 3,4
// 4 -z (front) 0-45deg, 315-360 : 0,7,8
// map every 1/8 of the 360 degrees to a face
const halfAngleToFacesMap = new Map<number,number>([[0,4],[1,1],[2,1],[3,5],[4,5],[5,0],[6,0],[7,4],[8,4]])

export class Game{
    private loadedPlayerMeshes:{[key:string]:AbstractMesh};
    private assetsManager:AssetsManager;
    
    private guiScene:Scene;
    private gui:Gui;

    private scene:Scene;
    private gameGui:GameGui; // gui on the main scene for things like nicknames is part of the main scene

    private myModel:number;
    private myName:string;
    private canvas:HTMLCanvasElement;
    private timeManager:TimeManager;
    private reflectionProbe:ReflectionProbe;




    channel:any;
    player: AbstractMesh;
    camera: ArcRotateCamera;
    shadowGenerator: CascadedShadowGenerator;
    controller: Controller;
    mpController: MPController;
    map: BasicMap;
    skybox:Mesh;

    sun:Mesh;
    sunLight:DirectionalLight;

    //game init
    async gameStart(){
        this.timeManager = new TimeManager(
            constants.DAYNIGHT_CYCLE as unknown as boolean,
            constants.DEFAULT_TIME);
        
        await this.sceneInit();
        await this.loadPlayer();
        
        //timeManager initialization

        // this.timeManagerInit(true,Date.now());

        await this.meshesInit();
        
        this.addSceneRoutines();

        // map loading
        await this.mapInit();
        
        

        //await this.loadWater();

        this.player.physicsImpostor = new PhysicsImpostor(
            this.player, 
            PhysicsImpostor.CapsuleImpostor , 
            { 
                mass: constants.CHARACTER_MASS as number, 
                restitution: constants.CHARACTER_RESTITUTION as number, 
                friction: constants.CHARACTER_FRICTION as number, 
            }, 
            this.scene);
        
        //movement handling
        this.controller = new Controller(
            this.scene, 
            this.camera , 
            this.player, 
            constants.CHARACTER_SPEED);

        // add plane with name and id on top of our player
        this.addPlayerGui("-1");

        //mp controller initialization
        if(constants.CONNECT_TO_BACKEND) this.mpControllerInit();
        
        this.updateSky();
        
        this.camera.attachControl(this.canvas,true,false);
    }

    //sets render distance, initializes scene, camera, skybox and fog, calls physics init as part of scene initialization, pointer lock and inspector
    async sceneInit(): Promise<void>{
        //dont create the scene but reuse the old one
        this.scene.useRightHandedSystem = true;

        //skybox and fog
        this.camera = this.cameraInit(this.scene);
        const skybox_cutoff = (
            variables.RENDER_DISTANCE-constants.PHYSICS_RENDER_DISTANCE*Math.sqrt(2))
        var skybox = MeshBuilder.CreateSphere("skyBox", {diameter:2*skybox_cutoff, segments:10}, this.scene) //2*
        //var skybox  = MeshBuilder.CreateCylinder("skyBox",{diameter:2*skybox_cutoff, height:500})
        skybox.applyFog = false;
        this.skybox = skybox;
        var skyMaterial = new SkyMaterial("skyMaterial", this.scene);
        skyMaterial.backFaceCulling = false;
        skyMaterial.luminance = constants.SKY_LUMINANCE;
        skyMaterial.useSunPosition = true;

        skybox.material = skyMaterial;
        

        this.scene.fogMode = Scene.FOGMODE_LINEAR; //was Scene.FOGMODE_LINEAR
        this.scene.fogDensity = variables.FOG_DENSITY;
        this.scene.fogStart = variables.FOG_START; 
        this.scene.fogEnd = skybox_cutoff;
        this.scene.fogEnabled = true;

        this.scene.fogColor = new Color3( 
            constants.DEFAULT_FOG_COLOR_R, 
            constants.DEFAULT_FOG_COLOR_G, 
            constants.DEFAULT_FOG_COLOR_B);
            
        await this.physicsInit();
        
        this.pointerLock();
    }

    //mpController init, adds routines and controller on game object
    async mpControllerInit(){
        //handles loading of other players
        this.mpController = new MPController(
            this.player, 
            this.shadowGenerator,
            this.scene,
            this.myModel, 
            this.loadedPlayerMeshes, 
            this.myName, 
            this.gameGui
        );
        
        //teleport the player to desired location from server request
        this.mpController.channel.on("teleport_request", async (data)=>{
            this.camera.inputs.attached.pointers.detachControl();
            // this.player.physicsImpostor.dispose();
            this.player.setAbsolutePosition(new Vector3(data.position.x,data.position.y,data.position.z));
            // this.player.position = new Vector3(data.position.x,data.position.y,data.position.z);

            let i=constants.MAP_LOADING_STEPS;
            while(i){
                await this.map.mapLoadingLogic();
            }

            this.map.mapLoadingLogic().finally(()=>{
                this.assetsManager.load();
                this.camera.inputs.attachInput(this.camera.inputs.attached.pointers);
                // this.player.physicsImpostor = new PhysicsImpostor(this.player, PhysicsImpostor.CapsuleImpostor, { mass: 60, restitution: 0, friction: 1 }, this.scene);
            });
            
        });
        this.mpController.channel.on("my_id",(data)=>{
            this.mpController.myId = data;
            this.gameGui.playerGui.updateId("-1",data);
        });
        this.mpController.channel.on("time",(data:number)=>{
            this.timeManager.setTime(data);
        });
        this.mpController.channel.on("timeChange",(data:number)=>{
            this.timeManager.setTime(data);
            this.updateSky();
            this.updateSky();
        });
        this.mpController.channel.on("cycleChange",(data:boolean)=>{

            if(data) console.log("Day night cycle has been turned on");
            else console.log("Day night cycle has been turned off");

            this.timeManager.cycle.set(data);
        });
        this.mpController.channel.on("chat_message", (message:{[key:string]:string})=>{
            //this.gui.displayChatMessage(message);
        });

        this.mpController.channel.on("timeResponse",(data:number)=>{
            console.log("Got server time:", data);
            this.timeManager.setTime(data);
            this.updateSky();
            this.updateSky();
        });
        this.mpController.channel.on("dayNightCycleResponse", (data:boolean)=>{
            console.log("Got server day night cycle:", data);
            this.timeManager.cycle.set(data);
        })

        this.mpController.channel.emit("timeRequest", {reliable:true});
        this.mpController.channel.emit("dayNightCycleRequest", {reliable:true});
        this.mpController.channel.emit("playerInfo", new PlayerInfo(this.myModel,this.myName));
    }

    async mapInit(){
        if(constants.TEST_MAP){
            const mapModule = await import("./map/TestMap");
            this.map = new mapModule.TestMap(            
                this.player,
                this.scene,
                this.assetsManager,
                this.shadowGenerator,
                this.camera
            );
            await this.map.loadMap();
        }
        else{
            this.map = new DynamicMap(
                this.player,
                this.scene,
                this.assetsManager,
                this.shadowGenerator);
    
            
            await this.map.chunkmapDownload();
            await this.map.loadMap(true);
        }

    }

    //camera init, returns camera object
    cameraInit(scene:Scene): ArcRotateCamera{

        var camera = new ArcRotateCamera(
            "Camera", //name
            constants.GAME_CAMERA_ALPHA, //alpha
            constants.GAME_CAMERA_BETA, //beta
            constants.GAME_CAMERA_RADIUS, //radius
            Vector3.Zero(), //target 
            scene);
        
        camera.lowerRadiusLimit = constants.GAME_CAMERA_LOWERRADIUSLIMIT;
        camera.upperRadiusLimit = constants.GAME_CAMERA_UPPERRADIUSLIMIT;
        camera.lowerBetaLimit = constants.GAME_CAMERA_LOWERBETALIMIT;
        camera.inertia=constants.GAME_CAMERA_INERTIA;
        camera.angularSensibilityX = variables.GAME_CAMERA_ANGULARSENSIBILITY_X;
        camera.angularSensibilityY = variables.GAME_CAMERA_ANGULARSENSIBILITY_Y;
        camera.maxZ = variables.RENDER_DISTANCE+constants.GAME_CAMERA_MAXZ_ADD;
        camera.checkCollisions = true;
        camera.collisionRadius = new Vector3(
            constants.GAME_CAMERA_COLLISIONRADIUS_X,
            constants.GAME_CAMERA_COLLISIONRADIUS_Y,
            constants.GAME_CAMERA_COLLISIONRADIUS_Z);

        //custom camera movement
        //this.pointer_inputs = camera.inputs.attached.pointers;
        //camera.inputs.attached.pointers.detachControl(); //camera.inputs.attached.pointers
        camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); //maybe add custom pointer inputs which would be modified babylonjs pointerinputs
        
        return(camera);
    }

    //PHYSICS INIT needs camera present
    async physicsInit(): Promise<void>{
        const ammo = await Ammo();
        var physicsPlugin = new AmmoJSPlugin(true, ammo);
        
        const gravity = new Vector3(0,constants.WORLD_GRAVITY,0);

        this.scene.enablePhysics(gravity,physicsPlugin);
    }

    //pointer lock
    private pointerLock(): void{
        //We start without being locked.
        var isLocked = false;
        
        // On click event, request pointer lock
        this.scene.onPointerDown = (evt)=> {
                //true/false check if we're locked, faster than checking pointerlock on each single click.
            if (!isLocked) {
                this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
                if (this.canvas.requestPointerLock) {
                    this.canvas.requestPointerLock();
                }
            }
            
        };

        // Event listener when the pointerlock is updated (or removed by pressing ESC for example).
        var pointerlockchange = function () {
            var controlEnabled = document.pointerLockElement || null;
            
            // If the user is already locked
            if (!controlEnabled) {
                //this.camera.detachControl(this.canvas);
                isLocked = false;
            } else {
                //this.camera.attachControl(this.canvas);
                isLocked = true;
            }
        };
        
        // Attach events to the document
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mspointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);
        document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
    }
    
    //inspector init, nothing fancy
    async inspectorInit(scene:Scene): Promise<void>{

        // debug
        if(constants.DEBUG_MODE){
            await import("@babylonjs/core")
            await import("@babylonjs/core/Debug/debugLayer")
            await import("@babylonjs/inspector");
    
            await import("@babylonjs/node-editor")
            await import("@babylonjs/core/Loading/sceneLoader")
            await import("@babylonjs/loaders/glTF")
        };

        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey) {
                
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }
        });
        
    }
    
    //loads player and adds head for camera to attatch to, relies on assets manager to be already loaded
    async loadPlayer(position?:Vector3,model?:number,headHeight?:number): Promise<void>{
        var p:AbstractMesh
        if(model&&Math.abs(model)+1) p = this.loadedPlayerMeshes[model].clone("player",null);
        else p = this.loadedPlayerMeshes[this.myModel].clone("player",null);
        //var p:AbstractMesh = this.loadedPlayerMeshes[this.myModel].clone("player",null);
        
        var head = MeshBuilder.CreateBox("head",{ size: 0.01 }, this.scene)
        head.isVisible =false;
        p.position = Vector3.Zero();
        head.position = p.position;
        p.isVisible = true;
        head.setParent(p);
        if(Math.abs(headHeight)+1)head.position.y +=headHeight;
        else head.position.y += constants.CHARACTER_HEAD_HEIGHT;
        if(position) p.position = position
        else p.position = new Vector3(
            constants.CHARACTER_STARTING_POS_X,
            constants.CHARACTER_STARTING_POS_Y,
            constants.CHARACTER_STARTING_POS_Z);
        p.receiveShadows = true;
        this.player = p;
    }

    //adds player name and id on top of this.player
    addPlayerGui(id:string){
        const mainPlayerText = this.gameGui.playerGui.createPlayerText(this.player, this.myName, id);
        
        this.scene.onBeforeCameraRenderObservable.add(()=>{
            this.gameGui.playerGui.setGuiScaleOnPlayerFromCamera(mainPlayerText,this.player.absolutePosition);
        })
    }

    //updates the sky on a given time frame
    updateSky(){
        const date = new Date(0)
        date.setUTCSeconds(this.timeManager.getTime()/1000)

        const sun_pos = SUNCALC.getPosition(date,constants.SUN_LATITUDE,constants.SUN_LONGITUDE);

        // AZIMUTH, ALTITUDE TO XYZ COORDINATES
        // y/r = sine(altitude) => y = r*sine(altitude)
        // d^2 + y^2 = r^2, d>=0 => d = sqrt(r^2-y^2)
        // x/d = sine(azimuth) => x = d*sine(azimuth)
        // z/d = cosine(azimuth) => z = d*cosine(azimuth)
        const y = (variables.RENDER_DISTANCE)*Math.sin(sun_pos.altitude);
        const d = Math.sqrt(variables.RENDER_DISTANCE_SQ-y*y);
        const z = d*Math.cos(sun_pos.azimuth);
        const x = d*Math.sin(sun_pos.azimuth);

        var sun_on_dome = new Vector3(x,y,z);

        var playerXZ = this.player.absolutePosition.clone();
        playerXZ.y -= this.player.absolutePosition.y;

        sun_on_dome.addInPlace(playerXZ);
        
        if(sun_on_dome.y>constants.SUNRISE_HEIGHT){
            
            this.sunLight.intensity = constants.SUN_INTENSITY;
            this.sunLight.setDirectionToTarget(playerXZ); //this.player.absolutePosition.subtractFromFloats(0,this.player.absolutePosition.y,0)
            this.sunLight.position = sun_on_dome
            
        }
        else{
            this.sunLight.intensity = 0;
        }
        
        this.skybox.position = playerXZ;
        (<SkyMaterial> this.skybox.material).sunPosition = sun_on_dome;
        this.sun.position = sun_on_dome;
    }

    //updates the fog color based on sky color where the player is looking
    updateFog(){
        // var pixels: Promise<ArrayBufferView>;
        var player_rotation: number;
        this.reflectionProbe.position = this.player.position
        if(this.player.rotationQuaternion) player_rotation = this.player.rotationQuaternion.toEulerAngles().y%(Math.PI*2);
        else player_rotation=this.player.rotation.y;
        if(player_rotation<0) player_rotation = Math.PI*2 + player_rotation;

        // TO OPTIMIZE, IS TAKING A LOT OF TIME TO READ THE PIXELS
        this.reflectionProbe.cubeTexture.readPixels(
            halfAngleToFacesMap.get(Math.floor(180*player_rotation/(45*Math.PI))),
            0).then((res)=>{this.scene.fogColor = new Color3(res[0]/255, res[1]/255, res[2]/255);})
        

    }

    //lights, shadows, basic scene models like cube and spheres, sun movement
    async meshesInit(): Promise<void>{
        
        // ambient light
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);
        light1.intensity = constants.AMBIENT_LIGHT_INTENSITY;

        // sun light
        var light = new DirectionalLight("dir01", new Vector3(1, -1, 0), this.scene);
        // light.position = new Vector3(0, 40, 0);
        light.autoCalcShadowZBounds = true;
        this.sunLight = light;


        // shadow generation
        this.shadowGenerator = new CascadedShadowGenerator(constants.SHADOWGEN_TEXTURE_SIZE, light, true);
        this.shadowGenerator.addShadowCaster(this.player);

        this.shadowGenerator.numCascades = constants.SHADOWGEN_NUMCASCADES;
        this.shadowGenerator.cascadeBlendPercentage = constants.SHADOWGEN_CASCADEBLENDPERCENTAGE;
        this.shadowGenerator.lambda = constants.SHADOWGEN_LAMBDA;
        this.shadowGenerator.transparencyShadow = constants.SHADOWGEN_TRANSPARENCYSHADOW as unknown as boolean;
        this.shadowGenerator.usePercentageCloserFiltering = true;

       

        //sun reflection probe
        this.reflectionProbe = new ReflectionProbe("skyReflection", 1, this.scene)
        this.reflectionProbe.renderList.push(this.skybox);
        this.camera.customRenderTargets.push(this.reflectionProbe.cubeTexture)
        //this.scene.environmentTexture = this.reflectionProbe.cubeTexture;
        
        this.sun = MeshBuilder.CreateSphere("sun", { diameter: 10 }, this.scene);
        
    }
    async addSceneRoutines(){
        // adds the engine routine responsible for updating fog, sun position and time passing
        this.scene.onBeforeRenderObservable.add(()=>{
            
            if(variables.FRAME_COUNT%constants.SUN_UPDATE_INTERVAL===0 && this.timeManager.cycle.get()){
                this.updateSky();
            }
            if(variables.FRAME_COUNT%constants.FOG_UPDATE_INTERVAL===0){
                // TO OPTIMIZE, READ pixels is too slow
                // this.updateFog();
            }
            
            //frame step
            variables.FRAME_COUNT+=1;
            // time step
            if(this.timeManager.cycle.get())this.timeManager.timeAdd(constants.TIME_SCALE*16.666666*this.scene.getAnimationRatio());
        })
    }    

    constructor(scene:Scene,guiScene:Scene,gui:Gui,assetsManager:AssetsManager,loadedPlayerMeshes:{[key:string]:AbstractMesh},myModel:number, myName:string){
        this.canvas = document.querySelector("canvas");

        this.scene = scene;
        this.gameGui = new GameGui(this.scene); // responsible for things that happen in game like nick names

        this.guiScene = guiScene;
        this.gui = gui; // responsible for things like on screen buttons
        
        this.assetsManager = assetsManager;
        this.loadedPlayerMeshes = loadedPlayerMeshes;
        this.myModel = myModel;
        this.myName = myName;
    }
}
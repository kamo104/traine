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
import Ammo from 'ammo.js'


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
import {DynamicMap} from "./map/map"

//GUI
import {Gui} from "./gui/gui";



export class Game{
    //things game needs before being loaded 
    private loaded_player_meshes:{[key:string]:AbstractMesh};
    private assetsManager:AssetsManager;
    private scene:Scene;
    private guiScene:Scene;
    private gui:Gui;
    private my_model:number;
    private canvas:HTMLCanvasElement;

    model_map:{[key:number]:string}
    channel:any;
    player: AbstractMesh;
    //ground: AbstractMesh;
    camera: ArcRotateCamera;
    render_distance: number;
    physics_render_distance: number;
    shadow_generator: CascadedShadowGenerator; //ShadowGenerator
    sky_material: SkyMaterial;
    controller: Controller;
    mpController: MPController;
    dynamicMap: DynamicMap;
    skybox:Mesh;
    time:number;

    //game init
    async gameStart(){
        this.render_distance = 500; //was 275 //120k for moderate //500 for mid
        this.physics_render_distance = 275; // 50 for highqual 100 for low //120k for moderate
        //gameInit();
        await this.sceneInit();
        await this.loadPlayer();
        await this.meshesInit();
        
        //give controlls to player
        this.dynamicMap = new DynamicMap(this.player,this.scene,this.assetsManager,this.render_distance,this.physics_render_distance,this.shadow_generator, "eu_mid")
        await this.dynamicMap.chunkmapDownload();
        await this.dynamicMap.loadMap()
        //await this.loadWater();

        this.player.physicsImpostor = new PhysicsImpostor(this.player, PhysicsImpostor.CapsuleImpostor, { mass: 60, restitution: 0, friction: 1 }, this.scene);
        
        //movement handling
        this.controller = new Controller(this.scene, this.camera , this.player, 10);
        
        //handles loading of other players
        this.mpController = new MPController(this.player, this.shadow_generator,this.scene, this.render_distance,this.my_model, this.loaded_player_meshes);
        
        //teleport the player to desired location from server request
        this.mpController.channel.on("teleport_request",(data)=>{
            this.camera.inputs.attached.pointers.detachControl();
            this.player.physicsImpostor.dispose();
            this.player.position = new Vector3(data.position.x,data.position.y,data.position.z);
            this.dynamicMap.mapLoadingLogic().finally(()=>{
                this.assetsManager.load();
                this.camera.inputs.attachInput(this.camera.inputs.attached.pointers);
                this.player.physicsImpostor = new PhysicsImpostor(this.player, PhysicsImpostor.CapsuleImpostor, { mass: 60, restitution: 0, friction: 1 }, this.scene);
            });
            
        });
        this.mpController.channel.on("time",(data:number)=>{
            this.time=data;
        });
        this.mpController.channel.on("chat_message", (message:{[key:string]:string})=>{
            //this.gui.displayChatMessage(message);
        });

        this.camera.attachControl(this.canvas,true,false);
    }
    //sets render distance, initializes scene, camera, skybox and fog, calls physics init as part of scene initialization, pointer lock and inspector
    async sceneInit(): Promise<void>{
        //set render distance
        

        //dont create the scene but reuse the old one
        this.scene.useRightHandedSystem = true;

        //skybox and fog
        this.camera = this.cameraInit(this.scene);
        const skybox_cutoff = (this.render_distance-120*Math.sqrt(2))
        var skybox = MeshBuilder.CreateSphere("skyBox", {diameter:2*skybox_cutoff, segments:10}, this.scene) //2*
        //var skybox  = MeshBuilder.CreateCylinder("skyBox",{diameter:2*skybox_cutoff, height:500})
        skybox.applyFog = false;
        this.skybox = skybox;
        var skyMaterial = new SkyMaterial("skyMaterial", this.scene);
        skyMaterial.backFaceCulling = false;
        skyMaterial.luminance = 0.9;
        skyMaterial.useSunPosition = true;

        this.sky_material = skyMaterial
        skybox.material = skyMaterial;
        
        //skybox.infiniteDistance = true;
        

        this.scene.fogMode = Scene.FOGMODE_LINEAR; //was Scene.FOGMODE_LINEAR
        this.scene.fogDensity = 1;
        this.scene.fogStart = 100; 
        this.scene.fogEnd = skybox_cutoff;
        this.scene.fogEnabled = true;

        this.scene.fogColor = new Color3( 228/255, 224/255, 215/255);


        await this.physicsInit();
        
        this.pointerLock();

        //this.inspectorInit(this.scene); //debug
    }
    //camera init, returns camera object
    cameraInit(scene:Scene): ArcRotateCamera{

        var camera = new ArcRotateCamera("Camera", 0, Math.PI / 2, 0, Vector3.Zero(), scene);
        //var camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this.scene);
        camera.lowerRadiusLimit = 0;
        camera.upperRadiusLimit = 80;
        camera.lowerBetaLimit = -Math.PI/2+0.1;
        //camera.upperBetaLimit = Math.PI/2;
        //camera.beta = Math.PI/3;
        camera.alpha = Math.PI*1/2;
        camera.inertia=0.5;
        camera.angularSensibilityX = 2000;
        camera.angularSensibilityY = 2000;
        //camera.attachControl(canvas, true);
        camera.maxZ = this.render_distance+500;
        camera.checkCollisions = true
        camera.collisionRadius = new Vector3(0.5,1,0.5);

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
        //physicsPlugin.setMaxSteps(1000);
        //physicsPlugin.setTimeStep(1000/60)
        this.scene.enablePhysics(new Vector3(0,-9.81,0), physicsPlugin);
        
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

        await import("@babylonjs/core")
        await import("@babylonjs/core/Debug/debugLayer")
        await import("@babylonjs/inspector");

        //debug
        await import("@babylonjs/node-editor")
        await import("@babylonjs/core/Loading/sceneLoader")
        await import("@babylonjs/loaders/glTF")

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
        if(model&&Math.abs(model)+1) p = this.loaded_player_meshes[model].clone("player",null);
        else p = this.loaded_player_meshes[this.my_model].clone("player",null);
        //var p:AbstractMesh = this.loaded_player_meshes[this.my_model].clone("player",null);
        
        var head = MeshBuilder.CreateBox("head",{ size: 0.01 }, this.scene)
        head.isVisible =false;
        p.position = Vector3.Zero();
        head.position = p.position;
        p.isVisible = true;
        head.setParent(p)
        if(Math.abs(headHeight)+1)head.position.y +=headHeight;
        else head.position.y += 1.723;
        if(position) p.position = position
        else p.position = new Vector3(0,80,0);
        p.receiveShadows = true;
        this.player = p;
    }
    //lights, shadows, basic scene models like cube and spheres, sun movement
    async meshesInit(): Promise<void>{
        
        //ambient light
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);
        light1.intensity = 0.2;

        //shadow light
        var light = new DirectionalLight("dir01", new Vector3(1, -1, 0), this.scene);
        light.position = new Vector3(0, 40, 0);
        light.autoCalcShadowZBounds = true;


        this.shadow_generator = new CascadedShadowGenerator(4096, light);
        this.shadow_generator.addShadowCaster(this.player);

        this.shadow_generator.numCascades = 4;
        this.shadow_generator.cascadeBlendPercentage = 0.05;
        this.shadow_generator.lambda = 1;
        this.shadow_generator.transparencyShadow = true
        // this.shadow_generator.autoCalcDepthBounds = true;


       

        //sun reflection probe
        var rp = new ReflectionProbe("skyReflection", 1, this.scene)
        rp.renderList.push(this.skybox);
        this.camera.customRenderTargets.push(rp.cubeTexture)
        //this.scene.environmentTexture = rp.cubeTexture;
        
        var sun: Mesh = MeshBuilder.CreateSphere("sun", { diameter: 10 }, this.scene);

        this.time =Date.now();
        var j=0;
	    this.scene.onBeforeRenderObservable.add(()=>{
            if(j%10==0){
                var date = new Date()
                date.setTime(this.time)
                //51.1657° N, 10.4515° E germany //
                const sun_pos = SUNCALC.getPosition(date,51.1657,10.4515)
                
                const sun_on_dome = new Vector3(Math.sin(sun_pos.azimuth)*(this.render_distance),Math.sin(sun_pos.altitude)*(this.render_distance),Math.cos(sun_pos.altitude)*(this.render_distance))
                
                sun_on_dome.addInPlace(this.player.absolutePosition)
                sun_on_dome.y -= this.player.absolutePosition.y

                //sun_on_dome.y -= 1.7;
                if(sun_on_dome.y>-10){
                    
                    light.intensity = 1;
                    light.setDirectionToTarget(this.player.absolutePosition.subtractFromFloats(0,this.player.absolutePosition.y,0)); //abs pos player
                    light.position = sun_on_dome
                    this.sky_material.sunPosition = sun_on_dome
                    this.skybox.position = this.player.absolutePosition
                    sun.position = sun_on_dome
                }
                else{
                    light.intensity = 0;
                    //light.setDirectionToTarget(this.player.absolutePosition);
                    //light.position = sun_on_dome.add(this.player.position)
                    this.sky_material.sunPosition = sun_on_dome
                    sun.position = sun_on_dome
                }
                
            }
            if(j%52==0){
                rp.position = this.player.position
                var player_rotation = this.player.rotationQuaternion.toEulerAngles().y%(Math.PI*2);
                if(player_rotation<0){
                    player_rotation = 2*Math.PI+player_rotation;
                }
                var pixels; //:Promise<>
                if((player_rotation<=Math.PI*2&&player_rotation>=Math.PI*7/4)||(player_rotation>=0&&player_rotation<=Math.PI/4)){
                    pixels = rp.cubeTexture.readPixels(2,0)
                }
                else if(player_rotation<=Math.PI*3/4&&player_rotation>Math.PI/4){
                    pixels = rp.cubeTexture.readPixels(1,0)
                }
                else if(player_rotation<=Math.PI*5/4&&player_rotation>Math.PI*3/4){
                    pixels = rp.cubeTexture.readPixels(5,0)
                }
                else if(player_rotation<=Math.PI*7/4&&player_rotation>Math.PI*5/4){
                    pixels = rp.cubeTexture.readPixels(0,0)
                }
                //console.log(pixels, player_rotation)
                
                pixels.then((res)=>{
                    this.scene.fogColor = new Color3(res[0]/255, res[1]/255, res[2]/255);
                })
            }

            j+=1;

            this.time+=1000;
        })
        
    }
    

    constructor(scene:Scene,guiScene:Scene,gui:Gui,assetsManager:AssetsManager,loaded_player_meshes:{[key:string]:AbstractMesh},my_model:number){
        this.canvas = document.querySelector("canvas");
        this.scene = scene;
        this.guiScene = guiScene;
        this.gui = gui;
        this.assetsManager = assetsManager;
        this.loaded_player_meshes = loaded_player_meshes;
        this.my_model = my_model;
    }
}
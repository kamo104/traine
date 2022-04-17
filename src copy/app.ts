//shared across all modules
import { Scene } from "@babylonjs/core/scene"
import { AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh"
import { Vector3,Color3 } from "@babylonjs/core/Maths/math"

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
//physics load
//import Ammo from 'ammojs-typed';
import Ammo from 'ammo.js'
//camera module
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera"

//materials module
import { SkyMaterial } from "@babylonjs/materials/sky/skyMaterial"

//unique to app.ts
import { Engine } from "@babylonjs/core/Engines/engine"
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight"
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight"
import "@babylonjs/core/Loading/loadingScreen";



//custom controller
import {Controller} from "./movement/playerMovementController";

//multiplayerController
import {MPController} from "./multiplayer/multiplayer"

//dynamicMap
import {DynamicMap} from "./map/map"

import * as GMATH from "./gmath"
const model_map:{[key:number]:string} = {0:"robot",1:"sofa"};


var canvas = document.querySelector("canvas");
var engine = new Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
engine.enableOfflineSupport = false;
engine.doNotHandleContextLost = true;
//on resize change size of canvas
window.addEventListener("resize", ()=>{ engine.resize() });

class App {
    channel:any;
    scene: Scene;
    assetsManager: AssetsManager;
    player: AbstractMesh;
    ground: AbstractMesh;
    camera: ArcRotateCamera;
    render_distance: number;
    physics_render_distance: number;
    shadow_generator: CascadedShadowGenerator; //ShadowGenerator
    sky_material: SkyMaterial;
    controller: Controller;
    mpController: MPController;
    dynamicMap: DynamicMap;
    my_model:number;
    loaded_player_meshes:{[key:string]:AbstractMesh};
    
    //loads player and calls the rest of the init functions (scene, player, meshes, handleMP, handleMapLoading)
    async gameInit(): Promise<void>{
        await this.sceneInit();

        this.assetsManager = new AssetsManager(this.scene);
        this.my_model = 0;
        await this.loadPlayerMeshes();
        await this.loadPlayer();
        this.sky_material.sunPosition = new Vector3(this.player.position.x,this.player.position.y+this.render_distance,this.player.position.z)
        //this.scene.fogColor = Color3.Black();

        await this.meshesInit();
    }
    //sets render distance, initializes scene, camera, skybox and fog, calls physics init as part of scene initialization, pointer lock and inspector
    async sceneInit(): Promise<void>{
        //set render distance
        this.render_distance = 275;
        this.physics_render_distance = 150;
        this.scene = new Scene(engine);
        this.scene.useRightHandedSystem = true;
        //this.scene.clearColor = new Color4(0.31, 0.48, 0.64, 1.0);

        //skybox and fog
        //var skybox = Mesh.CreateBox();
        this.camera = this.cameraInit();
        const skybox_cutoff = (this.render_distance-30)
        var skybox = MeshBuilder.CreateSphere("skyBox", {diameter:2*skybox_cutoff}, this.scene) //2*
        skybox.applyFog = false;

        var skyMaterial = new SkyMaterial("skyMaterial", this.scene);
        skyMaterial.backFaceCulling = false;
        skyMaterial.luminance = 0.2
        skyMaterial.azimuth =0;
        //skyMaterial.inclination =0.5
        skyMaterial.useSunPosition = true;
        
        

        this.sky_material = skyMaterial
        skybox.material = skyMaterial;
        
        skybox.infiniteDistance = true;
        

        this.scene.fogMode = Scene.FOGMODE_LINEAR; //was exp
        this.scene.fogDensity = 1; //was at 1
        this.scene.fogStart = this.physics_render_distance-100; 
        this.scene.fogEnd = skybox_cutoff; //sho7uld be on
        this.scene.fogEnabled = true;

        this.scene.fogColor = new Color3( 228/255, 224/255, 215/255);
        //this.scene.fogColor = Color3.Black();

        await this.physicsInit();

        this.pointerLock();

        //this.inspectorInit(); //debug
    }
    //camera init, returns camera object
    cameraInit(): ArcRotateCamera{

        var camera = new ArcRotateCamera("Camera", 0, Math.PI / 2, 0, Vector3.Zero(), this.scene);
        //var camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this.scene);
        camera.lowerRadiusLimit = 0;
        camera.upperRadiusLimit = 80;
        camera.lowerBetaLimit = -Math.PI/2+0.1;
        //camera.upperBetaLimit = Math.PI/2;
        camera.beta = Math.PI/3;
        camera.alpha = Math.PI*1/2;
        camera.inertia=0.5;
        camera.angularSensibilityX = 2000;
        camera.angularSensibilityY = 2000;
        camera.attachControl(canvas, true);
        camera.maxZ = this.render_distance;
        camera.checkCollisions = true
        camera.collisionRadius = new Vector3(0.5,1,0.5);

        //custom camera movement
        //this.pointer_inputs = camera.inputs.attached.pointers;
        camera.inputs.attached.pointers.detachControl(); //camera.inputs.attached.pointers
        camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
        
        
        return(camera);
    }
    //PHYSICS INIT needs camera present
    async physicsInit(): Promise<void>{
        const ammo = await Ammo();
        var physicsPlugin = new AmmoJSPlugin(true, ammo);
        this.scene.enablePhysics(new Vector3(0,-9.81,0), physicsPlugin);
    }
    //pointer lock
    private pointerLock(): void{
        //We start without being locked.
        var isLocked = false;
        
        // On click event, request pointer lock
        this.scene.onPointerDown = function (evt) {
                //true/false check if we're locked, faster than checking pointerlock on each single click.
            if (!isLocked) {
                canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
                if (canvas.requestPointerLock) {
                    canvas.requestPointerLock();
                }
            }
            
        };

        // Event listener when the pointerlock is updated (or removed by pressing ESC for example).
        var pointerlockchange = function () {
            var controlEnabled = document.pointerLockElement || null;
            
            // If the user is already locked
            if (!controlEnabled) {
                //this.camera.detachControl(canvas);
                isLocked = false;
            } else {
                //this.camera.attachControl(canvas);
                isLocked = true;
            }
        };
        
        // Attach events to the document
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mspointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);
        document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
    }
    /*
    //inspector init, nothing fancy
    inspectorInit(): void{
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey) {
                if (this.scene.debugLayer.isVisible()) {
                    this.scene.debugLayer.hide();
                } else {
                    this.scene.debugLayer.show();
                }
            }
        });
    }
    */
    //loads all player meshes for later use
    async loadPlayerMeshes(): Promise<void>{
        this.loaded_player_meshes = {};
        Object.entries(model_map).forEach(([index,mesh_name])=>{
            var mt1 = this.assetsManager.addMeshTask("load main player mesh", "", "./assets/player_models/", mesh_name +".obj");
            mt1.onSuccess = (task)=>{
                var p = task.loadedMeshes[0];
                p.isVisible =false;
                p.position = Vector3.Zero();
                p.receiveShadows = true;
                p.physicsImpostor = new PhysicsImpostor(p, PhysicsImpostor.NoImpostor,{ mass: 60, restitution: 0, friction: 1 }, this.scene)
                //p.rotation.y =Math.PI;
                this.loaded_player_meshes[index] = p;
            }
            
        })
        await this.assetsManager.loadAsync();
    }
    //loads player and adds head for camera to attatch to, relies on assets manager to be already loaded
    async loadPlayer(): Promise<void>{

        //var mt1 = this.assetsManager.addMeshTask("load main player mesh", "", "./assets/player_models/", model_map[this.my_model] +".obj");
        /*
        var p:AbstractMesh;
        mt1.onSuccess = function (task) {
            p = task.loadedMeshes[0];
            var head = MeshBuilder.CreateBox("head",{ size: 0.01 }, this.scene)
            head.isVisible =false;
            p.position = Vector3.Zero();
            head.position = p.position;
            
            head.setParent(p)
            head.position.y += 1.723;
            p.position = new Vector3(0,33,0)
            p.receiveShadows = true;
            //p.rotation.y =Math.PI;
        }
        await this.assetsManager.loadAsync();
        */
        var p = this.loaded_player_meshes[this.my_model].clone("player",null);
        var head = MeshBuilder.CreateBox("head",{ size: 0.01 }, this.scene)
        head.isVisible =false;
        p.position = Vector3.Zero();
        head.position = p.position;
        p.isVisible = true;
        head.setParent(p)
        head.position.y += 1.723;
        p.position = new Vector3(0,33,0)
        p.receiveShadows = true;
        this.player = p;
    }
    //lights, shadows, basic scene models like cube and spheres, sun movement
    async meshesInit(): Promise<void>{
        

        var box: Mesh = MeshBuilder.CreateBox("box", { size: 1 }, this.scene);
        box.position = new Vector3(0,50,0);
        box.physicsImpostor = new PhysicsImpostor(box, PhysicsImpostor.BoxImpostor, { mass: 20, restitution: 0.6, friction: 1 }, this.scene);
        box.receiveShadows = true;

        //ambient light
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);
        light1.intensity = 0.2;


        //shadow light
        var light = new DirectionalLight("dir01", new Vector3(1, -1, 0), this.scene);
        light.position = new Vector3(0, 40, 0);
        light.autoCalcShadowZBounds = true;


        this.shadow_generator = new CascadedShadowGenerator(4096, light);
        this.shadow_generator.addShadowCaster(this.player);
        this.shadow_generator.addShadowCaster(box);
        this.shadow_generator.numCascades = 4;
        this.shadow_generator.cascadeBlendPercentage = 0.05;
        this.shadow_generator.lambda = 1;
        // this.shadow_generator.autoCalcDepthBounds = true;

        //variable collection for minecraft light
        var time:number =Math.PI/2; //init at 0 for sunrise
        var player_pos = this.player.absolutePosition;

        //variable collection for real light
        var time2:number = 0;
        const R = 10;
        const r = 1/2;
        const gamma = (90-23.5)*(1/360)*2*Math.PI; //was 23.5
        const postion_in_angle = 45;
        const u = postion_in_angle*(1/360)*2*Math.PI; // rad
        var alpha:number=0;
        var beta:number=0;
        var earth: Mesh = MeshBuilder.CreateSphere("earth", { diameter: 1 }, this.scene);
        var point_on_earth: Mesh = MeshBuilder.CreateSphere("point_on_earth", { diameter: 0.1 }, this.scene);
        var sun_on_dome: Mesh = MeshBuilder.CreateSphere("sun_on_dome", { diameter: 0.05 }, this.scene);
        //changing sun position every frame
	    this.scene.onBeforeRenderObservable.add(()=>{
            
            player_pos = this.player.getAbsolutePosition();
            //time+=0.001;
            /*
            //light minecraft style
            const x = player_pos.x-this.render_distance*1/10*Math.cos(time);
            const y = player_pos.y+this.render_distance*1/10*Math.sin(time);
            const z = player_pos.z;
            light.setDirectionToTarget(this.player.absolutePosition);
            light.position.set(x,y,z);
            */
            //testing my simulation
            //light.setDirectionToTarget(this.player.absolutePosition);
            //light.position.set(0,-40,0)

            var sun_pos = this.player.absolutePosition;

            const x2 =R*Math.cos(alpha); // +r*Math.cos(gamma*Math.cos(alpha))
            const z2 =R*Math.sin(alpha); // +r*Math.sin(gamma*Math.sin(alpha))
            const y2 =sun_pos.y;
            const earth_pos = new Vector3(x2+sun_pos.x,y2+1.7,z2+sun_pos.z)
            earth.position = earth_pos; //was earth_pos


            const x_1 = r*Math.cos(gamma+u);
            const x_2 = r*Math.cos(gamma-u);
            const z_1 = r*Math.sin(gamma+u);
            const z_2 = r*Math.sin(gamma-u);
            const xp = (x_2 + x_1)/2 + ((x_2 - x_1)/2)*(Math.cos(beta))
            const zp = (z_2 + z_1)/2 + ((z_2 - z_1)/2)*(Math.cos(beta))
            const yp = ((x_2 - x_1)/2)*(Math.sin(beta));

            const final_vect = new Vector3(xp+earth_pos.x,zp+earth_pos.y,yp+earth_pos.z);
            point_on_earth.position = final_vect; //was GMATH.deltaVector(final_vect,earth_pos)
            
            const local_vect = final_vect.subtract(sun_pos);
            const sun_point_dist = local_vect.length()
            const rk = sun_point_dist-(0.05)
            const xs = (1-rk/sun_point_dist)*local_vect.x
            const ys = (1-rk/sun_point_dist)*local_vect.y
            const zs = (1-rk/sun_point_dist)*local_vect.z
            sun_on_dome.position = new Vector3(local_vect.x-xs+sun_pos.x,local_vect.y-ys+sun_pos.y,local_vect.z-zs+sun_pos.z)


            time2+=0.01;
            alpha = (time2/(365*24))*2*Math.PI;
            beta = (time2/(24))*2*Math.PI; //  /3600
        })
        
    }
    
    
    
    //init the game, then give controlls to player, and start the render loop
    constructor() {

        this.gameInit().then(() =>{
            //give controlls to player
            this.dynamicMap = new DynamicMap(this.player,this.scene,this.assetsManager,this.render_distance,this.physics_render_distance,this.shadow_generator)
            this.dynamicMap.loadMap().finally(()=>{

                this.camera.inputs.attachInput(this.camera.inputs.attached.pointers);
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
                        this.camera.inputs.attachInput(this.camera.inputs.attached.pointers);
                        this.player.physicsImpostor = new PhysicsImpostor(this.player, PhysicsImpostor.CapsuleImpostor, { mass: 60, restitution: 0, friction: 1 }, this.scene);
                    });
                    
                });

                engine.runRenderLoop(() => { 
                    this.scene.render();
                    //this.scene.cleanCachedTextureBuffer();
                });

            });

            // run the main render loop
            
        })
        
    }  
}

//x.finally(()=>{})
let c = new App();
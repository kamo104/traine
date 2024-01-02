//shared across all modules
import {Scene} from "@babylonjs/core/scene"
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import {Color3, Vector3} from "@babylonjs/core/Maths/math"

import {Mesh} from "@babylonjs/core/Meshes/mesh"

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
//shadows module
import { CascadedShadowGenerator } from "@babylonjs/core/Lights/Shadows/cascadedShadowGenerator"

//assets Module
import { AssetsManager } from '@babylonjs/core/Misc/assetsManager';

//physics module
import { PhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor';
import { HingeJoint } from "@babylonjs/core/Physics/physicsJoint";
import { PhysicsJointData } from "@babylonjs/core/Physics/physicsJoint";

import { BasicMap } from "./basicMap";

import { GrassManager } from "./grassManager";


// game constants and variables
import * as TRAINE from "../index"

import { initDistanceMaterial } from "../materials/distanceMaterial"

import { StandardMaterial, Texture, Angle, RenderTargetTexture, Constants } from "@babylonjs/core";

export class TestMap implements BasicMap{
    private player: AbstractMesh;
    private camera: ArcRotateCamera
    private scene: Scene;
    private assetsManager: AssetsManager;
    private shadowGenerator: CascadedShadowGenerator;

    grassManager: GrassManager;

    async loadMap(){
        await this.mapLoadingLogic();


        // await this.addTrain();
        this.addGrass();

        this.player.position.y = 1
        // this.camera.beta =0;
        // this.camera.alpha =0;
        // this.camera.radius =0;
        this.camera.radius = 5;
        this.camera.alpha = Angle.FromDegrees(0).radians();
        this.camera.beta = Angle.FromDegrees(120).radians();


        // const render = new RenderTargetTexture("screen",10,this.scene,{type:Constants.TEXTURETYPE_FLOAT}); // ,{type:BABYLON.Constants.TEXTURETYPE_FLOAT, format:BABYLON.Constants.TEXTUREFORMAT_RGBA}
    

        // render.renderList.push(this.scene.getMeshByName("ground"));

        // this.scene.customRenderTargets.push(render);

        // render.activeCamera = this.camera;

        // render.render();

        // this.scene.onAfterRenderObservable.add(()=>{
        //     render.render();
        //     if(TRAINE.variables.FRAME_COUNT==100) render.readPixels().then(console.log);
        // })
        
    }

    async addGrass(){
        
        
        // const grass1 = MeshBuilder.CreateBox("grass1",{},this.scene);
        const grass2 = MeshBuilder.CreateCapsule("grass2",{},this.scene);

        const grassTask = this.assetsManager.addMeshTask("grassBladeDownload", "","/assets/map/models/","grassBlade.obj");
        await this.assetsManager.loadAsync();

        const grass1 = grassTask.loadedMeshes[0];
        this.shadowGenerator.addShadowCaster(grass1);

        // grass1.isVisible = false;
        grass1.material = new StandardMaterial("grassMaterial", this.scene);
        grass1.material.backFaceCulling = false;
        (<StandardMaterial> grass1.material).alpha = 1;
        (<StandardMaterial> grass1.material).diffuseColor = new Color3(0, 154/255, 23/255);
        // (<StandardMaterial> grass1.material).ambientColor = new Color3(0,1,0);
        grass1.scaling = new Vector3(1,1,1)
        // grass1.position.y = 0.5;
        



        
        const grassDensity1 = new Texture("/textures/eu_mid/water/eu.0497.png",this.scene,false,false,undefined,()=>{

            grassDensity1.wrapU = Texture.CLAMP_ADDRESSMODE;
            grassDensity1.wrapV = Texture.CLAMP_ADDRESSMODE;
            this.grassManager.populateWithGrass(
                this.scene.getMeshByName("ground"),
                [10,20],
                [grassDensity1,grassDensity1],
                [grass1,grass2],
                [5000,0]);
            
            grass1.isVisible = false;
        });

        
    }
    async addTrain(){
        //const train = new AbstractMesh("train", this.scene);
        const trainPhysicsRoot = new Mesh("trainPhysicsRoot", this.scene);
        
        //train.addChild(trainPhysicsRoot);
        const t1 = this.assetsManager.addMeshTask("testMapLoad","","./assets/models/","CargoTrain_Front.glb")
        var loadedMeshes:AbstractMesh[];

        

        t1.onSuccess = (task)=>{
            for(const mesh of task.loadedMeshes){
                loadedMeshes = task.loadedMeshes;
                // if(mesh.name=="__root__")continue;
                if(mesh.name.startsWith("physics")){
                    mesh.isVisible=false;
                }
                else if(mesh.parent == null){
                    
                    this.shadowGenerator.addShadowCaster(mesh);
                    // mesh.material.backFaceCulling=false;
                }
                else{
                    mesh.isPickable=true;
                    mesh.receiveShadows = true;
                }

                if(mesh.name.startsWith("wheel")){
                    mesh.parent=null
                    
                }
                else{
                    trainPhysicsRoot.addChild(mesh);
                }
                
                

                
            }
            for(const mesh of task.loadedMeshes){
                
                 if(mesh.name.startsWith("wheel")){
                    mesh.scaling.x = Math.abs(mesh.scaling.x);
                    mesh.scaling.y = Math.abs(mesh.scaling.y);
                    mesh.scaling.z = Math.abs(mesh.scaling.z);
                    // mesh.position.y+=4;
                    mesh.physicsImpostor = new PhysicsImpostor(mesh, PhysicsImpostor.CylinderImpostor, {mass: 100,friction:10}, this.scene);
                    mesh.isVisible = true;
                }
                else if(mesh.name.startsWith("physics")){
                    mesh.scaling.x = Math.abs(mesh.scaling.x);
                    mesh.scaling.y = Math.abs(mesh.scaling.y);
                    mesh.scaling.z = Math.abs(mesh.scaling.z);
                    mesh.physicsImpostor = new PhysicsImpostor(mesh, PhysicsImpostor.BoxImpostor, {mass: 0.1}, this.scene);
                    
                }
            }
            
        }
       
        await this.assetsManager.loadAsync();

        trainPhysicsRoot.physicsImpostor = new PhysicsImpostor(trainPhysicsRoot, PhysicsImpostor.NoImpostor,{ mass: 14400},this.scene);

        //adding wheel joints

        for(const mesh of loadedMeshes){
            //const position = mesh.position.clone()
            //position.z+=1;
            if(mesh.name.startsWith("wheel")===false) continue;

            const jointData:PhysicsJointData = {
                mainAxis:new Vector3(0,0,1),
                connectedAxis: new Vector3(0, 0, 1),
                mainPivot:mesh.position,

                nativeParams:{
                    min: 0,
                    limit: [0, 0],
                    max: 0,
    
                    spring: [0, 0],
    
                }

                // connectedPivot: mesh.absolutePosition,
            };
            // = new HingeJoint(jointData)
            const joint = new HingeJoint(jointData)
            
            
            
            trainPhysicsRoot.physicsImpostor.addJoint(mesh.physicsImpostor,joint)

            trainPhysicsRoot.addChild(mesh)
            joint.setMotor(-1,100);
            
        }

        


    }

    async mapLoadingLogic(){
        const t1 = this.assetsManager.addMeshTask("testMapLoad","","./assets/map/TestMap/","TestMap.obj")
        const map_root = new Mesh("MapRoot",this.scene);
        map_root.position.x += 10;
        // map_root.scaling = new Vector3(0.2,1,0.2)

        map_root.physicsImpostor = new PhysicsImpostor(map_root,PhysicsImpostor.NoImpostor, { mass: 0, restitution: 0, friction: TRAINE.constants.MAP_CUBE_IMPOSTOR_FRICTION as number }, this.scene)
        
        t1.onSuccess = (task)=>{
            for(const mesh of task.loadedMeshes){
                // mesh.checkCollisions = true;
                mesh.isPickable=true;
                mesh.receiveShadows = true;
                // mesh.freezeWorldMatrix();
                mesh.parent = null;
                if(mesh.name!="__root__")
                mesh.physicsImpostor = new PhysicsImpostor(mesh, PhysicsImpostor.MeshImpostor, { mass: 0, restitution: 0, friction: TRAINE.constants.MAP_CUBE_IMPOSTOR_FRICTION as number }, this.scene);
                
                mesh.parent = map_root
                if(mesh.name!=="ground")
                this.shadowGenerator.addShadowCaster(mesh);

                if(mesh.name === "ground"){
                    var material = initDistanceMaterial(this.scene);
                    material.setFloat('maxDistance',20);
                    material.setFloat('viewerY',10);

                    mesh.material = material;
                    
                }
            }
            
        }
        await this.assetsManager.loadAsync();

    }

    async chunkmapDownload(){}

    constructor(player: AbstractMesh,
        scene: Scene,
        assetsManager: AssetsManager,
        shadowGenerator: CascadedShadowGenerator,
        camera:ArcRotateCamera){

        this.player = player;
        this.camera = camera;
        this.scene = scene;
        this.assetsManager = assetsManager
        this.shadowGenerator = shadowGenerator;

        var worker = new Worker(new URL("grassWorker.ts", import.meta.url));
        const canvas = document.getElementById("offscreenCanvas") as HTMLCanvasElement;
        const offscreenCanvas = canvas.transferControlToOffscreen()

        worker.postMessage({ canvas : offscreenCanvas}, [offscreenCanvas]);

        this.grassManager = new GrassManager(this.scene,worker);
    }
}
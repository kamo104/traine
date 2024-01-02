//shared across all modules
import {Scene} from "@babylonjs/core/scene"
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import {Color3, Vector3} from "@babylonjs/core/Maths/math"

//shadows module
import { CascadedShadowGenerator } from "@babylonjs/core/Lights/Shadows/cascadedShadowGenerator"

//assets Module
import { AssetsManager } from '@babylonjs/core/Misc/assetsManager';

//physics module
import { PhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor';

//materials module
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Material } from "@babylonjs/core/Materials/material";

//debug
import { Observer } from "@babylonjs/core";

//chunk_info
//import * as chunkMap from './chunk_info.json';

//nodematerial test
import { NodeMaterial } from "@babylonjs/core/Materials/Node/nodeMaterial"

// material creation from code
import {InputBlock,TransformBlock,VertexOutputBlock,GradientBlockColorStep,VectorSplitterBlock,GradientBlock,FragmentOutputBlock} from "@babylonjs/core/Materials/Node/Blocks"
import {NodeMaterialSystemValues} from "@babylonjs/core/Materials/Node/Enums/nodeMaterialSystemValues"

import { BasicMap } from "./basicMap";

//math functions
import * as GMATH from "../gmath"

// game constants and variables
import {constants} from "../constants";
import {variables} from "../variables";
import { keyBindings } from "../keyBindings";

const physicsRenderDistSquared = constants.PHYSICS_RENDER_DISTANCE*constants.PHYSICS_RENDER_DISTANCE;
const scaling = new Vector3(constants.MAP_SCALE_X,constants.MAP_SCALE_Y,constants.MAP_SCALE_Z)

export class DynamicMap implements BasicMap {
    private player: AbstractMesh;
    private scene: Scene;
    private assetsManager: AssetsManager;
    private shadow_generator: CascadedShadowGenerator;
    private groundMaterial: StandardMaterial;

    loadedChunksNames = []; //array of string chunk names
    private loadedChunkMeshes:{[key:string]:AbstractMesh} = {}; //object with convention {eu.$$$ : AbstractMesh}
    private ready_for_phys = []; //array of string chunk names
    private addedToPhysics = []; // make  private
    private chunkMap:Map<number,[number,number,number]> = new Map();
    // private chunkMap:{[key:string]:{[key:string]:string}};

    doMapLoading:boolean;

    async chunkmapDownload(){  
        const chunkMapReq = await fetch("./assets/map/" + constants.MAP_NAME + "/chunk_info.json")
        const buffer:{[key:string]:[number,number,number]} = await chunkMapReq.json()
        Object.entries(buffer).forEach(([k,v])=>{
            this.chunkMap.set(+k,v);
        })
    }
    /**
     * Function that builds a ground material from chunk name
     * @param chunk_num name of the chunk (used to add a texture and name the material)
     */
    buildGroundMaterial(chunk_num:number): StandardMaterial{
        var material = new StandardMaterial("eu_mid_diff"+chunk_num, this.scene)

        var texture = new Texture("textures/"+constants.MAP_NAME+"/sliced/"+chunk_num+".png", this.scene)
        texture.wrapU = Texture.CLAMP_ADDRESSMODE;
        texture.wrapV = Texture.CLAMP_ADDRESSMODE;
        //material.bumpTexture = texture; //maybe add bump sometime
        material.specularColor = new Color3(0.25, 0.25, 0.25);
        material.specularPower = 16;
        material.diffuseTexture = texture;
        return material;
    }
    buildGradientMaterial() {
        var nodeMaterial = new NodeMaterial(`COPY RAMP FROM`,this.scene);
        
        var position = new InputBlock("position");
        position.setAsAttribute("position");
    
        var worldPos = new TransformBlock("worldPos");
        worldPos.complementZ = 0;
        worldPos.complementW = 1;
        position.output.connectTo(worldPos.vector);
    
        var world = new InputBlock("world");
        world.setAsSystemValue(NodeMaterialSystemValues.World);
        world.output.connectTo(worldPos.transform);
    
        var worldPosviewProjectionTransform = new TransformBlock("worldPos * viewProjectionTransform");
        worldPosviewProjectionTransform.complementZ = 0;
        worldPosviewProjectionTransform.complementW = 1;
        worldPos.output.connectTo(worldPosviewProjectionTransform.vector);
    
        var viewProjection = new InputBlock("viewProjection");
        viewProjection.setAsSystemValue(NodeMaterialSystemValues.ViewProjection);
        viewProjection.output.connectTo(worldPosviewProjectionTransform.transform);
    
        var vertexOutput = new VertexOutputBlock("vertexOutput");
        worldPosviewProjectionTransform.output.connectTo(vertexOutput.vector);
    
        var VectorSplitter = new VectorSplitterBlock("VectorSplitter");
        position.output.connectTo(VectorSplitter.xyzIn);
    
        var Gradient = new GradientBlock("Gradient");
        // 464.658 -245.635 
        const mapHeight = 464.658
        const minHeight = -245.635
        const step_valCol:[number,string][] = [[0,"#000000"],[0.278091,"#3E3828"],[0.575409,"#564E35"],[0.638318,"#948B63"],[0.638636,"#253C30"],[0.660727,"#1E5A2D"],[0.819,"#404040"],[0.977273,"#7C7C7C"],[1.0,"#A3A3A3"]]
        const nsteps = 8
        for (var i=0;i<nsteps;i+=1){
            Gradient.colorSteps.push(new GradientBlockColorStep(mapHeight * (step_valCol[i][0]-0.1) + minHeight, Color3.FromHexString(step_valCol[i][1])));
            //console.log(Color3.FromHexString(step_valCol[i][1]))
        }

        VectorSplitter.y.connectTo(Gradient.gradient);
    
        var fragmentOutput = new FragmentOutputBlock("fragmentOutput");
        Gradient.output.connectTo(fragmentOutput.rgb);
        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragmentOutput);
        nodeMaterial.build();
    
        return nodeMaterial;
    }

    async mapLoadingLogic(): Promise<void>{
        this.chunkMap.forEach((v,k)=>{
                const v_p_dist = GMATH.positionDistanceSqrXZVectorArray(
                    this.player.absolutePosition.multiplyByFloats(
                        1/constants.MAP_SCALE_X,
                        1/constants.MAP_SCALE_Y,
                        1/constants.MAP_SCALE_Z),
                    v);
                
                if(v_p_dist<variables.RENDER_DISTANCE_SQ){
                    if(!this.loadedChunksNames.includes(k)){
                        this.loadedChunksNames.push(k);
                        const t1 = this.assetsManager.addMeshTask("load map mesh","", "./assets/map/" + constants.MAP_NAME + "/obj/",String(k)+".obj");
                        t1.onSuccess = (task)=>{
                            
                            const mesh = task.loadedMeshes[0];
                            mesh.name = constants.MAP_NAME +"_"+ k;

                            mesh.scaling = scaling;
                            mesh.position.y -=200;
                            mesh.checkCollisions = true;
                            mesh.isPickable=true;
                            
                            
                            mesh.material = this.buildGroundMaterial(k);

                            mesh.freezeWorldMatrix();
                            
                            this.loadedChunkMeshes[k] = mesh;

                            //shadows
                            mesh.receiveShadows = true;
                            this.ready_for_phys.push(k);
                        }
                    }
                    else if(this.ready_for_phys.includes(k)&&v_p_dist<physicsRenderDistSquared){
                        this.ready_for_phys.splice(this.ready_for_phys.indexOf(k),1)

                        this.loadedChunkMeshes[k].physicsImpostor = new PhysicsImpostor(
                            this.loadedChunkMeshes[k], 
                            PhysicsImpostor.MeshImpostor, 
                            { 
                                mass: 0, 
                                restitution: 0, 
                                friction: constants.MAP_MESH_IMPOSTOR_FRICTION as number
                            }, 
                            this.scene);

                        this.shadow_generator.addShadowCaster(this.loadedChunkMeshes[k], false);
                        
                        this.loadedChunkMeshes[k].physicsImpostor.sleep();

                        this.addedToPhysics.push(k);
                    }
                    else if(this.addedToPhysics.includes(k)&&this.loadedChunkMeshes[k].physicsImpostor!==undefined&&v_p_dist>physicsRenderDistSquared){
                        this.addedToPhysics.splice(this.addedToPhysics.indexOf(k),1)
                        this.loadedChunkMeshes[k].physicsImpostor.dispose();
                        this.ready_for_phys.push(k);
                        this.shadow_generator.removeShadowCaster(this.loadedChunkMeshes[k], false);
                        // delete add_to_shadow_casting[k];
                    }
                }
                else {
                    if(this.loadedChunksNames.includes(k)){
                        try {
                            this.shadow_generator.removeShadowCaster(this.loadedChunkMeshes[k], false);
                            if(this.loadedChunkMeshes[k].material.getActiveTextures())this.loadedChunkMeshes[k].material.getActiveTextures()[0].dispose();
                            //if(this.loadedChunkMeshes[k].material.diffuseTexture)this.loadedChunkMeshes[k].material.diffuseTexture.dispose();
                            this.loadedChunkMeshes[k].material.dispose();
                            if(this.loadedChunkMeshes[k].physicsImpostor)this.loadedChunkMeshes[k].physicsImpostor.dispose();
                            this.loadedChunkMeshes[k].dispose()
                            delete this.loadedChunkMeshes[k]
                            this.loadedChunksNames.splice(this.loadedChunksNames.indexOf(k),1)
                        } catch (error) {
                            // buffer unload.
                        }
                        
                        // unload here
                        // console.log("unloaded chunk:", k)
                    }
                }
            }
            

        );
    }
    /**
     * Loads map based on the players position
     * @param {boolean} [continuous=true] if present defines whether to do dynamic map loading 
     */
    async loadMap(continuous?:boolean): Promise<void>{

        //load map
        for(var i:number=constants.MAP_LOADING_STEPS;i;i--){
            await this.mapLoadingLogic();
            await this.assetsManager.loadAsync();
        }
 
        // whenever a new chunk is being loaded dont display the loading screen
        this.assetsManager.useDefaultLoadingScreen = false;
        this.doMapLoading = true;

        if(continuous==false||continuous===undefined) return;

        this.scene.onBeforeRenderObservable.add(()=>{
            if(variables.FRAME_COUNT%constants.MAP_UPDATE_INTERVAL&&this.doMapLoading){
                this.mapLoadingLogic().finally(()=>{
                    this.assetsManager.loadAsync();
                });
            }
        })
        
    }
    async reloadMap(){
        this.doMapLoading=false;
        this.scene.clearCachedVertexData();
        Object.keys(this.loadedChunkMeshes).forEach((k)=>{
            //this.loadedChunkMeshes[k].material.diffuseTexture.dispose();
            //this.loadedChunkMeshes[k].material.dispose();
            this.loadedChunkMeshes[k].dispose();
        })
        this.loadedChunkMeshes = {}
        this.ready_for_phys = []
        this.loadedChunksNames = [];
        await this.loadMap(false);
    }
    //water experiment
    async loadWater() {
        let nodeMaterial = await NodeMaterial.ParseFromFileAsync("cool water", "/materials/waterNodeMaterial.json", this.scene);
        
        var gnd = MeshBuilder.CreateGround("testGround",{width:2,height:2,subdivisions:32},this.scene)
        //gnd.physicsImpostor = new PhysicsImpostor(gnd,PhysicsImpostor.BoxImpostor,{mass:0},this.scene);
        gnd.material = nodeMaterial;
        gnd.position.y +=70
        gnd.scaling = new Vector3(61, 61, 61);
        gnd.rotation.y = Math.PI*2;
    }
    
    constructor(player: AbstractMesh,
                scene: Scene,
                assetsManager: AssetsManager,
                shadow_generator: CascadedShadowGenerator){
        
        this.player = player;
        this.scene = scene;
        this.assetsManager = assetsManager
        this.shadow_generator = shadow_generator;
                    
    }


}
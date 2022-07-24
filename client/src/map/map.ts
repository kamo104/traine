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
//import * as chunk_map from './chunk_info.json';

//math functions
import * as GMATH from "../gmath"


//nodematerial test
import { NodeMaterial } from "@babylonjs/core/Materials/Node/nodeMaterial"

//manual creation
import {InputBlock,TransformBlock,VertexOutputBlock,GradientBlockColorStep,VectorSplitterBlock,GradientBlock,FragmentOutputBlock} from "@babylonjs/core/Materials/Node/Blocks"
import {NodeMaterialSystemValues} from "@babylonjs/core/Materials/Node/Enums/nodeMaterialSystemValues"






export class DynamicMap {
    private player: AbstractMesh;
    private scene: Scene;
    private assetsManager: AssetsManager;
    private render_distance: number;
    private physics_render_distance: number;
    private shadow_generator: CascadedShadowGenerator;
    private groundMaterial: StandardMaterial;

    loaded_chunks = []; //array of string chunk names
    loaded_chunk_meshes:{[key:string]:AbstractMesh} = {}; //object with convention {eu.$$$ : AbstractMesh} make private
    private ready_for_phys = []; //array of string chunk names
    added_to_phys = []; // make  private
    private chunk_map:{[key:string]:{[key:string]:string}};
    version:string

    doMapLoading:boolean;

    async chunkmapDownload(){  
        const chunkMapReq = await fetch("./assets/map/" + this.version + "/chunk_info.json") // eu_highqual eu_sliced
        this.chunk_map = await chunkMapReq.json()
    }
    buildGroundMaterial(k:string){
        var material = new StandardMaterial("eu-mid_diff"+k, this.scene)

        var texture = new Texture("textures/eu-mid/sliced/"+k+".png", this.scene)
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
        Object.entries(this.chunk_map).forEach(([k,v])=>{
            if(k!=="default"){
                const v_p_dist = GMATH.positionDistanceSqrXZ(this.player.absolutePosition,v);
                if(v_p_dist<(this.render_distance*this.render_distance)){
                    if(!this.loaded_chunks.includes(k)){
                        this.loaded_chunks.push(k);
                        let t1 = this.assetsManager.addMeshTask("load map mesh","", "./assets/map/" + this.version + "/obj/",k+".obj");
                        t1.onSuccess = (task)=>{
                            const mesh = task.loadedMeshes[0]
                            mesh.scaling = new Vector3(1.5,1.5,1.5)
                            mesh.position.y -=200
                            mesh.checkCollisions = true;
                            mesh.isPickable=true;
                            
                            
                            mesh.material = this.buildGroundMaterial(k);

                            

                            mesh.freezeWorldMatrix()
                            
                            this.loaded_chunk_meshes[k] = mesh

                            //shadows
                            mesh.receiveShadows = true;
                            this.ready_for_phys.push(k);
                        }
                    }
                    else if(this.ready_for_phys.includes(k)&&v_p_dist<(this.physics_render_distance*this.physics_render_distance)){
                        this.ready_for_phys.splice(this.ready_for_phys.indexOf(k),1)

                        this.loaded_chunk_meshes[k].physicsImpostor = new PhysicsImpostor(this.loaded_chunk_meshes[k], PhysicsImpostor.MeshImpostor, { mass: 0, restitution: 0, friction: 1 }, this.scene);

                        this.shadow_generator.addShadowCaster(this.loaded_chunk_meshes[k], false);

                        this.added_to_phys.push(k)
                    }
                    else if(this.added_to_phys.includes(k)&&this.loaded_chunk_meshes[k].physicsImpostor&&v_p_dist>(this.physics_render_distance*this.physics_render_distance)){
                        this.added_to_phys.splice(this.added_to_phys.indexOf(k),1)
                        this.loaded_chunk_meshes[k].physicsImpostor.dispose();
                        this.ready_for_phys.push(k);
                        this.shadow_generator.removeShadowCaster(this.loaded_chunk_meshes[k], false);
                        // delete add_to_shadow_casting[k];
                    }
                }
                else {
                    if(this.loaded_chunks.includes(k)){
                        try {
                            this.shadow_generator.removeShadowCaster(this.loaded_chunk_meshes[k], false);
                            if(this.loaded_chunk_meshes[k].material.getActiveTextures())this.loaded_chunk_meshes[k].material.getActiveTextures()[0].dispose();
                            //if(this.loaded_chunk_meshes[k].material.diffuseTexture)this.loaded_chunk_meshes[k].material.diffuseTexture.dispose();
                            this.loaded_chunk_meshes[k].material.dispose();
                            if(this.loaded_chunk_meshes[k].physicsImpostor)this.loaded_chunk_meshes[k].physicsImpostor.dispose();
                            this.loaded_chunk_meshes[k].dispose()
                            delete this.loaded_chunk_meshes[k]
                            this.loaded_chunks.splice(this.loaded_chunks.indexOf(k),1)
                        } catch (error) {
                            // buffer_deload.
                        }
                        
                        // unload here
                        // console.log("unloaded chunk:", k)
                    }
                }
            }
            

        });
    }
    // function to load map based on the players position
    async loadMap(continuous?:boolean): Promise<void>{

        // loads chunks initially
        await this.mapLoadingLogic();
        await this.assetsManager.loadAsync();

        // adds shadows
        await this.mapLoadingLogic();

        // adds physics
        await this.mapLoadingLogic();

        // whenever a new chunk is being loaded dont display the loading screen
        this.assetsManager.useDefaultLoadingScreen = false;
        this.doMapLoading = true;
        if(typeof(continuous)==="undefined"||continuous){
            let j=0;
            this.scene.onBeforeRenderObservable.add(()=>{
                if(j%60&&this.doMapLoading){
                    this.mapLoadingLogic();
                    this.assetsManager.loadAsync()
                }
                j+=1;
            })
            // setInterval(()=>{this.mapLoadingLogic()},1000);
            // setInterval(()=>{this.assetsManager.loadAsync()},1000);
        }
    }
    async reloadMap(){
        this.doMapLoading=false;
        this.scene.clearCachedVertexData();
        Object.keys(this.loaded_chunk_meshes).forEach((k)=>{
            //this.loaded_chunk_meshes[k].material.diffuseTexture.dispose();
            //this.loaded_chunk_meshes[k].material.dispose();
            this.loaded_chunk_meshes[k].dispose();
        })
        this.loaded_chunk_meshes = {}
        this.ready_for_phys = []
        this.loaded_chunks = [];
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
                render_distance: number,
                physics_render_distance: number,
                shadow_generator: CascadedShadowGenerator,
                version?:string){
                    
                    this.player = player;
                    this.scene = scene;
                    this.assetsManager = assetsManager
                    this.render_distance = render_distance;
                    this.physics_render_distance = physics_render_distance;
                    this.shadow_generator = shadow_generator;
                    if(version)this.version=version;
                    else this.version= "eu_sliced"
                    //this.chunkmapDownload();
                    
    }


}
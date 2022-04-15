//babylon core
import * as BABYLON from "@babylonjs/core";

//chunk_info
import * as chunk_map from './chunk_info.json';

//math functions
import * as GMATH from "../gmath"

export class DynamicMap {
    private player: BABYLON.AbstractMesh;
    private scene: BABYLON.Scene;
    private assetsManager: BABYLON.AssetsManager;
    private render_distance: number;
    private physics_render_distance: number;
    private shadow_generator: BABYLON.ShadowGenerator;

    loaded_chunks = []; //array of string chunk names
    private loaded_chunk_meshes = {}; //object with convention {eu.$$$ : BABYLON.AbstractMesh}
    private ready_for_phys = []; //array of string chunk names
    private added_to_phys = []; 


    async mapLoadingLogic(): Promise<void>{
        Object.entries(chunk_map).forEach(([k,v])=>{
            if(k!=="default"){
                const v_p_dist = GMATH.positionDistanceSqrXZ(this.player.absolutePosition,v);
                if(v_p_dist<(this.render_distance*this.render_distance)){
                    if(!this.loaded_chunks.includes(k)){
                        this.loaded_chunks.push(k)
                        var t1 = this.assetsManager.addMeshTask("load map mesh","", "./assets/map/eu_sliced/",k+".obj");
                        t1.onSuccess = (task)=>{
                            const mesh = task.loadedMeshes[0]
                            //mesh.position.y -=30
                            mesh.checkCollisions = true;
                            //phys impostor was here
                            mesh.isPickable=true;
                            var material = new BABYLON.StandardMaterial(k, this.scene)

                            var texture = new BABYLON.Texture("textures/eu/"+k+".png", this.scene)
                            texture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
                            texture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
                            this.scene;
                            material.specularColor = new BABYLON.Color3(0.25, 0.25, 0.25);
                            material.specularPower = 128;
                            material.diffuseTexture = texture;
                            //material.bumpTexture = texture; //maybe add bump sometime

                            mesh.material = material;

                            //console.log("here")
                            this.loaded_chunk_meshes[k] = mesh


                            //shadows
                            mesh.receiveShadows = true;
                            
                            this.ready_for_phys.push(k);
                        }
                        
                        
                        //console.log("loaded chunk:", k)
                    }
                    else if(this.ready_for_phys.includes(k)&&v_p_dist<(this.physics_render_distance*this.physics_render_distance)){
                        this.ready_for_phys.splice(this.ready_for_phys.indexOf(k),1)
                        
                        this.loaded_chunk_meshes[k].physicsImpostor = new BABYLON.PhysicsImpostor(this.loaded_chunk_meshes[k], BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0, restitution: 0, friction: 1 }, this.scene);

                        this.added_to_phys.push(k)

                        this.shadow_generator.addShadowCaster(this.loaded_chunk_meshes[k], false);

                    }
                    else if(this.added_to_phys.includes(k)&&this.loaded_chunk_meshes[k].physicsImpostor&&v_p_dist>(this.physics_render_distance*this.physics_render_distance)){
                        this.added_to_phys.splice(this.added_to_phys.indexOf(k),1)
                        this.loaded_chunk_meshes[k].physicsImpostor.dispose();
                        this.ready_for_phys.push(k);
                        this.shadow_generator.removeShadowCaster(this.loaded_chunk_meshes[k], false);
                        //delete add_to_shadow_casting[k];
                    }
                    //load the chunk
                    //console.log(squareDistance(this.player.position,v));
                }
                else {
                    if(this.loaded_chunks.includes(k)){
                        try {
                            
                            this.loaded_chunks.splice(this.loaded_chunks.indexOf(k),1)
                            this.loaded_chunk_meshes[k].material.diffuseTexture.dispose();
                            this.loaded_chunk_meshes[k].material.dispose();
                            this.loaded_chunk_meshes[k].dispose()
                            delete this.loaded_chunk_meshes[k]
                        } catch (error) {
                            //buffer_deload.
                        }
                        
                        //unload here
                        //console.log("unloaded chunk:", k)
                    }
                }
            }
            
            //console.log(v,k)
        });
    }
    //function to load map based on the players position
    async loadMap(continuous?:boolean): Promise<void>{
        
        // ?? add unload buffer and spawn area loading before giving controlls
        ///////////////////////////////////////////////////////////////////
        //load new chunks based on the players location
        await this.mapLoadingLogic();
        await this.assetsManager.loadAsync();

        this.assetsManager.useDefaultLoadingScreen = false;
        if(typeof(continuous)==="undefined"||continuous){
            setInterval(()=>{this.mapLoadingLogic()},1000);
            setInterval(()=>{this.assetsManager.loadAsync()},1000);
        }
    }
    constructor(player: BABYLON.AbstractMesh,
                scene: BABYLON.Scene,
                assetsManager: BABYLON.AssetsManager,
                render_distance: number,
                physics_render_distance: number,
                shadow_generator: BABYLON.ShadowGenerator,){

                    this.player = player;
                    this.scene = scene;
                    this.assetsManager = assetsManager
                    this.render_distance = render_distance;
                    this.physics_render_distance = physics_render_distance;
                    this.shadow_generator = shadow_generator;

    }


}
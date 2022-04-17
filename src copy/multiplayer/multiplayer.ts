//shared across all modules
import { Scene } from "@babylonjs/core/scene";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Vector3,Quaternion } from "@babylonjs/core/Maths/math"

//shadows
import { CascadedShadowGenerator } from "@babylonjs/core/Lights/Shadows/cascadedShadowGenerator"

//gmath module
import * as GMATH from "../gmath"

//physics
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";

//communication with backend
import { io } from "socket.io-client"

import { player_data } from "./player_data";
import { passCubePixelShader } from "babylonjs/Shaders/passCube.fragment";

export class MPController{
    my_id:string;
    channel:any;
    my_model:number;

    private scene:Scene;
    private shadow_generator: CascadedShadowGenerator;
    private player: AbstractMesh;
    private render_distance:number;
    private loaded_player_meshes:{[key:number]:AbstractMesh};
    async handleMP(): Promise<void>{
        var loadedPlayers:{[key:string]:AbstractMesh;} = {}//player id : mesh
        var playerSnapshots:{[key:string]:[v0:player_data,v1:player_data,v2:player_data]} = {} //{player_id:[]}

        //remove player helper function
        const removePlayer = (id:string)=>{
            try{
                this.shadow_generator.removeShadowCaster(loadedPlayers[id], false);
                //console.log(loadedPlayers[id])
                loadedPlayers[id].dispose();
                delete playerSnapshots[id];
                delete loadedPlayers[id];
            }
            catch(err){
                // ?? add buffer on player disposition
                console.log(err);
            }
            
        }
        const addPlayer = (id:string, playerData:player_data)=>{
            //console.log(this.loaded_player_meshes[playerData.model])
            var p= this.loaded_player_meshes[playerData.model].clone(id, null, true) //changing for asset manager based loading loaded_player_meshes
            p.position = new Vector3(playerData.position.x,playerData.position.y,playerData.position.z);
            p.isVisible = true;
            p.physicsImpostor = new PhysicsImpostor(p, PhysicsImpostor.CapsuleImpostor, { mass: 60, restitution: 0, friction: 1 }, this.scene);
            //for no collisions with other players
            //p.physicsImpostor.dispose();
            this.shadow_generator.addShadowCaster(p);
            playerSnapshots[id] = [playerData,playerData,playerData]
            loadedPlayers[id]=p
        }

        //switched teleportation app.ts because the player was falling due to map loading

        //returns index given to player
        this.channel.on("my_id",(id:string)=>{
            this.my_id =id;
        });
        //boiler
        this.channel.on("connect",()=>{
            console.log("connected to log server!!")
        });
        //boiler
        this.channel.on("disconnect",()=>{
            console.log("disconnected from log server!!")
        });
        //gets the new player positions, sends position back and checks if there are any players to unload
        this.channel.on('position_data', (payload:{v:player_data}) => {
            //for each player in payload check validity of data and either create him or set snapshot of his pos
            Object.entries(payload).forEach(([k,v])=>{
                if(
                    v.position==undefined||v.rotation==undefined||v.model==undefined||
                    v.position.x==undefined||v.position.y==undefined||v.position.z==undefined||
                    v.rotation.x==undefined||v.rotation.y==undefined||v.rotation.z==undefined||v.rotation.w==undefined||
                    isNaN(v.position.x)||isNaN(v.position.y)||isNaN(v.position.z)||
                    isNaN(v.rotation.x)||isNaN(v.rotation.y)||isNaN(v.rotation.z)||isNaN(v.rotation.w)||
                    isNaN(v.model)
                    ){}
                else if(k!=this.my_id){
                    if(k in loadedPlayers){
                        //set latest snapshot to his position
                        playerSnapshots[k][2] = v;
                        
                    }
                    else{
                        //create new mesh
                        addPlayer(k,v);

                    }
                }
            })

            //send your position back
            const myPosition = this.player.absolutePosition;
            const myRotation = this.player.rotationQuaternion;
            const my_data:player_data = {position:{x:myPosition.x,y:myPosition.y,z:myPosition.z}, rotation:{x:myRotation.x,y:myRotation.y,z:myRotation.z,w:myRotation.w}, model:this.my_model}
            this.channel.emit('position_update', my_data);

            //check if any of the loaded players is outside visible zone and unload him
            Object.entries(loadedPlayers).forEach(([id,mesh])=>{
                if(GMATH.positionDistanceSqrXZ(mesh.absolutePosition,this.player.absolutePosition)>this.render_distance*this.render_distance){
                    try{
                        removePlayer(id);
                    }
                    catch(err){
                        // ?? add buffer on player disposition
                        console.log(err, "error when removing another player");
                    }
                }
            })
        });
        //removes the player
        this.channel.on("player_left",(id:string)=>{
            removePlayer(id);
        });
        
        //snapshot interpolation
        this.scene.onBeforeRenderObservable.add(()=>{
            //make players unable to fall
            for (const key of Object.keys(loadedPlayers)){
                const mesh = loadedPlayers[key]
                mesh.rotationQuaternion.set(0,mesh.rotationQuaternion.y,0,mesh.rotationQuaternion.w)
            }
            //snapshot interpolation
            for (const key of Object.keys(playerSnapshots)){
                const mesh = loadedPlayers[key]
                //console.log(playerSnapshots[key][2]);
                const avg = GMATH.positionAverage(GMATH.deltaPosition(playerSnapshots[key][2].position,playerSnapshots[key][1].position),GMATH.deltaPosition(playerSnapshots[key][1].position,playerSnapshots[key][0].position))
                const avgQuat = GMATH.quaternionAverage(GMATH.deltaQuaterion(playerSnapshots[key][2].rotation,playerSnapshots[key][1].rotation),GMATH.deltaQuaterion(playerSnapshots[key][1].rotation,playerSnapshots[key][0].rotation))
                
                mesh.rotationQuaternion = new Quaternion(playerSnapshots[key][2].rotation.x+avgQuat.x/20,playerSnapshots[key][2].rotation.y+avgQuat.y/20,playerSnapshots[key][2].rotation.z+avgQuat.z/20,playerSnapshots[key][2].rotation.w+avgQuat.w/20);
                mesh.position = new Vector3(playerSnapshots[key][2].position.x+avg.x/20,playerSnapshots[key][2].position.y+avg.y/20,playerSnapshots[key][2].position.z+avg.z/20);
                
                playerSnapshots[key][0] = playerSnapshots[key][1];
                playerSnapshots[key][1] = playerSnapshots[key][2];
                playerSnapshots[key][2] = {position:{x:mesh.position.x,y:mesh.position.y,z:mesh.position.z},
                                           rotation:{x:mesh.rotationQuaternion.x,y:mesh.rotationQuaternion.y,z:mesh.rotationQuaternion.z,w:mesh.rotationQuaternion.w},
                                           model:playerSnapshots[key][1].model,
                                           }
            }
        })
    }
    
    constructor(player: AbstractMesh, shadow_generator: CascadedShadowGenerator, scene:Scene, renderDistance:number, myModel:number, loaded_player_meshes:{[key:number]:AbstractMesh}){
        this.player = player;
        this.my_id = "-1";
        this.shadow_generator = shadow_generator;
        this.scene = scene
        this.render_distance = renderDistance;
        this.my_model = myModel;
        this.loaded_player_meshes = loaded_player_meshes;
        this.channel = io("wss://traine.servegame.com",{
            transports: ['polling', 'websocket'],
            transportOptions: {
              polling: {extraHeaders: {"model": String(myModel)}}
            }});
        this.handleMP();
    }
}

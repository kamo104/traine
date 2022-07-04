//shared across all modules
import { Scene } from "@babylonjs/core/scene";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Vector3,Quaternion } from "@babylonjs/core/Maths/math"

//physics
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";

//shadows
import { CascadedShadowGenerator } from "@babylonjs/core/Lights/Shadows/cascadedShadowGenerator"

//gmath module
import * as GMATH from "../gmath"



//communication with backend
import { io } from "socket.io-client"
import { Socket } from "socket.io-client"

import { player_data } from "./player_data";


export class MPController{
    my_id:string;
    channel:Socket;
    my_model:number;

    private scene:Scene;
    private shadow_generator: CascadedShadowGenerator;
    private player: AbstractMesh;
    private render_distance:number;
    private loaded_players:{[key:string]:AbstractMesh};
    private loaded_player_meshes:{[key:string]:AbstractMesh};
    private player_snaphots:{[key:string]:[v0:player_data,v1:player_data,v2:player_data]};


    // function for checking validity of player data, returns true if valid, else false
    isPlayerDataValid(v:player_data): boolean{
        if(
            v.position==undefined||v.rotation==undefined||v.model==undefined||
            v.position.x==undefined||v.position.y==undefined||v.position.z==undefined||
            v.rotation.x==undefined||v.rotation.y==undefined||v.rotation.z==undefined||v.rotation.w==undefined||
            isNaN(v.position.x)||isNaN(v.position.y)||isNaN(v.position.z)||
            isNaN(v.rotation.x)||isNaN(v.rotation.y)||isNaN(v.rotation.z)||isNaN(v.rotation.w)||
            isNaN(v.model)
            ) return false;
        return true;
    }
    addPlayer(id:string, playerData:player_data){
        if(id in this.loaded_players) return;
        //console.log(this.loaded_player_meshes[playerData.model])
        var p= this.loaded_player_meshes[playerData.model].clone(id, null, true) //changing for asset manager based loading loaded_player_meshes
        p.position = new Vector3(playerData.position.x,playerData.position.y,playerData.position.z);
        p.isVisible = true;
        p.physicsImpostor = new PhysicsImpostor(p, PhysicsImpostor.CapsuleImpostor, { mass: 60, restitution: 0, friction: 1 }, this.scene);
        //for no collisions with other players
        //p.physicsImpostor.dispose();
        this.shadow_generator.addShadowCaster(p);
        this.player_snaphots[id] = [playerData,playerData,playerData]
        this.loaded_players[id]=p
    }
    removePlayer(id:string){
        try{
            if((id in this.loaded_players)===false) return;
            this.shadow_generator.removeShadowCaster(this.loaded_players[id], true);
            //console.log(loadedPlayers[id])
            this.loaded_players[id].dispose();
            delete this.player_snaphots[id];
            delete this.loaded_players[id];
        }
        catch(err){
            // ?? add buffer on player disposition
            console.log(err);
        }
        
    }
    async handleMP(): Promise<void>{
        // var loadedPlayers:{[key:string]:AbstractMesh;} = {}//player id : mesh
        // var playerSnapshots:{[key:string]:[v0:player_data,v1:player_data,v2:player_data]} = {} //{player_id:[]}

        
        // const playerdataValid = (v:player_data)=>{
        //     if(
        //         v.position==undefined||v.rotation==undefined||v.model==undefined||
        //         v.position.x==undefined||v.position.y==undefined||v.position.z==undefined||
        //         v.rotation.x==undefined||v.rotation.y==undefined||v.rotation.z==undefined||v.rotation.w==undefined||
        //         isNaN(v.position.x)||isNaN(v.position.y)||isNaN(v.position.z)||
        //         isNaN(v.rotation.x)||isNaN(v.rotation.y)||isNaN(v.rotation.z)||isNaN(v.rotation.w)||
        //         isNaN(v.model)
        //         ) return false;
        //     return true;
        // }
        //remove player helper function
        // const removePlayer = (id:string)=>{
        //     try{
        //         this.shadow_generator.removeShadowCaster(loadedPlayers[id], false);
        //         //console.log(loadedPlayers[id])
        //         loadedPlayers[id].dispose();
        //         delete playerSnapshots[id];
        //         delete loadedPlayers[id];
        //     }
        //     catch(err){
        //         // ?? add buffer on player disposition
        //         console.log(err);
        //     }
            
        // }
        // const addPlayer = (id:string, playerData:player_data)=>{
        //     //console.log(this.loaded_player_meshes[playerData.model])
        //     var p= this.loaded_player_meshes[playerData.model].clone(id, null, true) //changing for asset manager based loading loaded_player_meshes
        //     p.position = new Vector3(playerData.position.x,playerData.position.y,playerData.position.z);
        //     p.isVisible = true;
        //     p.physicsImpostor = new PhysicsImpostor(p, PhysicsImpostor.CapsuleImpostor, { mass: 60, restitution: 0, friction: 1 }, this.scene);
        //     //for no collisions with other players
        //     //p.physicsImpostor.dispose();
        //     this.shadow_generator.addShadowCaster(p);
        //     playerSnapshots[id] = [playerData,playerData,playerData]
        //     loadedPlayers[id]=p
        // }

        //switched teleportation to manage in app.ts because the player was falling due to map loading

        //returns index given to player
        this.channel.on("my_id",(id:string)=>{
            this.my_id =id;
        });
        this.channel.on("connect",()=>{
            console.log("connected to log server!!")
        });
        this.channel.on("disconnect",()=>{
            console.log("disconnected from log server!!")
        });
        //removes the player
        this.channel.on("player_left",(id:string)=>{
            this.removePlayer(id);
        });
        //gets the new player positions, sends position back and checks if there are any players to unload
        this.channel.on('position_data', (payload:{[key:string]:player_data}) => {
            //for each player in payload check validity of data and either create him or set snapshot of his pos
            Object.entries(payload).forEach(([k,v])=>{
                if(this.isPlayerDataValid(v)&&k!=this.my_id){
                    if(k in this.loaded_player_meshes){
                        //set latest snapshot to his position
                        this.player_snaphots[k][2] = v;
                    }
                    else{
                        //create new mesh
                        this.addPlayer(k,v);
                    }
                }
            })

            //send your position back
            const myPosition = this.player.absolutePosition;
            let myRotation:any;
            if(this.player.rotationQuaternion) myRotation = this.player.rotationQuaternion;
            else myRotation = this.player.rotation
            const my_data:player_data = {position:{x:myPosition.x,y:myPosition.y,z:myPosition.z}, rotation:{x:myRotation.x,y:myRotation.y,z:myRotation.z,w:myRotation.w}, model:this.my_model}
            this.channel.emit('position_update', my_data);

            //check if any of the loaded players is outside visible zone and unload him
            Object.entries(this.loaded_player_meshes).forEach(([id,mesh])=>{
                if(GMATH.positionDistanceSqrXZ(mesh.absolutePosition,this.player.absolutePosition)>this.render_distance*this.render_distance){
                    try{
                        this.removePlayer(id);
                    }
                    catch(err){
                        // ?? add buffer on player disposition
                        console.log(err, "error when removing another player");
                    }
                }
            })
        });
        
        
    }
    // adds routines to the scene like snaphot interpolation or players standing upright
    addEngineRoutines():void{
        //snapshot interpolation and standing upright
        this.scene.onBeforeRenderObservable.add(()=>{
            //make players unable to fall over due to rotation
            for (const key of Object.keys(this.loaded_players)){
                const mesh = this.loaded_players[key];
                const rotation = mesh.rotationQuaternion.toEulerAngles();
                rotation.subtractFromFloats(rotation.x,0,rotation.z);
                
                mesh.rotationQuaternion = Quaternion.FromEulerVector(rotation);

                // mesh.rotationQuaternion.set(0,mesh.rotationQuaternion.y,0,mesh.rotationQuaternion.w)
            }
            //snapshot interpolation
            for (const key of Object.keys(this.player_snaphots)){
                const mesh = this.loaded_players[key]
                
                // const avg = GMATH.positionAverage(this.player_snaphots[key][2].position,this.player_snaphots[key][1].position,this.player_snaphots[key][0].position)
                const avg = GMATH.positionAverage(GMATH.deltaPosition(this.player_snaphots[key][2].position,this.player_snaphots[key][1].position),GMATH.deltaPosition(this.player_snaphots[key][1].position,this.player_snaphots[key][0].position))

                const avgQuat = GMATH.quaternionAverage(GMATH.deltaQuaterion(this.player_snaphots[key][2].rotation,this.player_snaphots[key][1].rotation),GMATH.deltaQuaterion(this.player_snaphots[key][1].rotation,this.player_snaphots[key][0].rotation))
                
                mesh.rotationQuaternion = new Quaternion(this.player_snaphots[key][2].rotation.x+avgQuat.x/20,this.player_snaphots[key][2].rotation.y+avgQuat.y/20,this.player_snaphots[key][2].rotation.z+avgQuat.z/20,this.player_snaphots[key][2].rotation.w+avgQuat.w/20);
                

                mesh.position = new Vector3(this.player_snaphots[key][2].position.x+avg.x/20,this.player_snaphots[key][2].position.y+avg.y/20,this.player_snaphots[key][2].position.z+avg.z/20);

                // push back the vault values and set the lastest one after modifications
                this.player_snaphots[key][0] = this.player_snaphots[key][1];
                this.player_snaphots[key][1] = this.player_snaphots[key][2];
                this.player_snaphots[key][2] = {position:{x:mesh.position.x,y:mesh.position.y,z:mesh.position.z},
                                           rotation:{x:mesh.rotationQuaternion.x,y:mesh.rotationQuaternion.y,z:mesh.rotationQuaternion.z,w:mesh.rotationQuaternion.w},
                                           model:this.player_snaphots[key][1].model,
                                           }
            }
        })
    }
    addChannelRoutines():void{
        //returns index given to player
        this.channel.on("my_id",(id:string)=>{
            this.my_id =id;
        });
        this.channel.on("connect",()=>{
            console.log("connected to log server!!")
        });
        this.channel.on("disconnect",()=>{
            console.log("disconnected from log server!!")
        });
        //removes the player
        this.channel.on("player_left",(id:string)=>{
            this.removePlayer(id);
        });
        //gets the new player positions, sends position back and checks if there are any players to unload
        this.channel.on('position_data', (payload:{v:player_data}) => {
            //for each player in payload check validity of data and either create him or set snapshot of his pos
            Object.entries(payload).forEach(([k,v])=>{
                if(this.isPlayerDataValid(v)&&k!=this.my_id){
                    if(k in this.loaded_players){
                        //set latest snapshot to his position
                        this.player_snaphots[k][2] = v;
                    }
                    else{
                        //create new mesh
                        this.addPlayer(k,v);
                    }
                }
            })

            //send your position back
            const myPosition = this.player.absolutePosition;
            let myRotation:any;
            if(this.player.rotationQuaternion) myRotation = this.player.rotationQuaternion;
            else myRotation = this.player.rotation
            const my_data:player_data = {position:{x:myPosition.x,y:myPosition.y,z:myPosition.z}, rotation:{x:myRotation.x,y:myRotation.y,z:myRotation.z,w:myRotation.w}, model:this.my_model}
            this.channel.emit('position_update', my_data);

            //check if any of the loaded players is outside visible zone and unload him
            Object.entries(this.loaded_player_meshes).forEach(([id,mesh])=>{
                if(GMATH.positionDistanceSqrXZ(mesh.absolutePosition,this.player.absolutePosition)>this.render_distance*this.render_distance){
                    try{
                        this.removePlayer(id);
                    }
                    catch(err){
                        // ?? add buffer on player disposition
                        console.log(err, "error when removing another player");
                    }
                }
            })
        });
    }
    constructor(player: AbstractMesh, shadow_generator: CascadedShadowGenerator, scene:Scene, renderDistance:number, myModel:number, loaded_player_meshes:{[key:number]:AbstractMesh}){
        this.player = player;
        this.my_id = "-1";
        this.shadow_generator = shadow_generator;
        this.scene = scene
        this.render_distance = renderDistance;
        this.my_model = myModel;
        this.loaded_player_meshes = loaded_player_meshes;
        this.loaded_players = {};
        this.player_snaphots = {};
        this.addEngineRoutines();
        this.channel = io("wss://traine.servegame.com"); //"http://localhost:3000" or "wss://traine.servegame.com"
        this.addChannelRoutines();
        // this.handleMP();
    }
}

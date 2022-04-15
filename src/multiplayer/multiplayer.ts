//babylon core
import * as BABYLON from "@babylonjs/core";
import * as GMATH from "../gmath"

//communication with backend
import {io} from "socket.io-client"
import { player_data } from "./player_data";

export class MPController{
    my_id:string;
    channel:any;

    private scene:BABYLON.Scene;
    private shadow_generator: BABYLON.ShadowGenerator;
    private player: BABYLON.AbstractMesh;
    private render_distance:number;

    //currently needs player to be already loaded for cloning the mesh and shadow generator for adding shadow casting
    //
    // ?? maybe add a function to take care of loading other players independently ??
    async handleMP(): Promise<void>{
        var loadedPlayers = {} //player id : mesh
        var playerSnapshots = {} //{player_id:[]}
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
        //teleport the player to desired location from server request
        this.channel.on("teleport_request",(data)=>{
            this.player.position = new BABYLON.Vector3(data.position.x,data.position.y,data.position.z);
        })
        //returns index given to player
        this.channel.on("my_id",(id:string)=>{
            this.my_id =id;
            //console.log(my_id)
        })
        //boiler
        this.channel.on("connect",()=>{
            console.log("connected to log server!!")
        })
        //boiler
        this.channel.on("disconnect",()=>{
            console.log("disconnected from log server!!")
        })
        //gets the new player positions, sends position back and checks if there are any players to unload
        this.channel.on('position_data', (payload:Object) => {
            Object.entries(payload).forEach(([k,v])=>{ //keys are player ids and v's are player positions
                //console.log(payload)
                if(k!=this.my_id){
                    if(k in loadedPlayers){
                        //set latest snapshot to his position
                        playerSnapshots[k][2] = v;
                    }
                    else{
                        //create new mesh
                        var p= this.player.clone(k,null, true)
                        p.position = new BABYLON.Vector3(v.position.x,v.position.y,v.position.z);
                        //p.physicsImpostor.dispose();
                        this.shadow_generator.addShadowCaster(p);
                        playerSnapshots[k] = [v,v,v]
                        loadedPlayers[k]=p
                    }
                }
            })
            //send your position back


            const my_data = {
                position:{x:this.player.absolutePosition.x,y:this.player.absolutePosition.y,z:this.player.absolutePosition.z},
                rotation:{x:this.player.rotationQuaternion.x,y:this.player.rotationQuaternion.y,z:this.player.rotationQuaternion.z,w:this.player.rotationQuaternion.w}
                //vel:this.player.physicsImpostor.getLinearVelocity()
            }
            this.channel.emit('position_update', my_data);

            //check if any of the loaded players is outside visible zone and unload him

            for (const key of Object.keys(loadedPlayers)){
                const mesh = loadedPlayers[key];
                if(GMATH.positionDistanceSqrXZ(mesh.absolutePosition,this.player.absolutePosition)>this.render_distance*this.render_distance){
                    try{
                        removePlayer(key);
                    }
                    catch(err){
                        // ?? add buffer on player disposition
                        console.log(err);
                    }
                }
            }
            
            
        })
        //removes the player
        this.channel.on("player_left",(id:string)=>{
            removePlayer(id);
        })
        
        //snapshot interpolation
        this.scene.onBeforeRenderObservable.add(()=>{
            for (const key of Object.keys(loadedPlayers)){
                const mesh = loadedPlayers[key]
                mesh.rotationQuaternion.set(0,mesh.rotationQuaternion.y,0,mesh.rotationQuaternion.w)
            }
            for (const key of Object.keys(playerSnapshots)){
                const mesh = loadedPlayers[key]
                //console.log(playerSnapshots[key][2]);
                const avg = GMATH.positionAverage(GMATH.deltaPosition(playerSnapshots[key][2].position,playerSnapshots[key][1].position),GMATH.deltaPosition(playerSnapshots[key][1].position,playerSnapshots[key][0].position))
                const avgQuat = GMATH.quaternionAverage(GMATH.deltaQuaterion(playerSnapshots[key][2].rotation,playerSnapshots[key][1].rotation),GMATH.deltaQuaterion(playerSnapshots[key][1].rotation,playerSnapshots[key][0].rotation))
                
                mesh.rotationQuaternion = new BABYLON.Quaternion(playerSnapshots[key][2].rotation.x+avgQuat.x/20,playerSnapshots[key][2].rotation.y+avgQuat.y/20,playerSnapshots[key][2].rotation.z+avgQuat.z/20,playerSnapshots[key][2].rotation.w+avgQuat.w/20);
                mesh.position = new BABYLON.Vector3(playerSnapshots[key][2].position.x+avg.x/20,playerSnapshots[key][2].position.y+avg.y/20,playerSnapshots[key][2].position.z+avg.z/20);
                
                playerSnapshots[key][0] = playerSnapshots[key][1];
                playerSnapshots[key][1] = playerSnapshots[key][2];
                playerSnapshots[key][2] = {position:{x:mesh.position.x,y:mesh.position.y,z:mesh.position.z},
                                           rotation:{x:mesh.rotationQuaternion.x,y:mesh.rotationQuaternion.y,z:mesh.rotationQuaternion.z,w:mesh.rotationQuaternion.w}
                                           }
            }

            
        })
    }
    
    constructor(player: BABYLON.AbstractMesh, shadow_generator: BABYLON.ShadowGenerator, scene:BABYLON.Scene, renderDistance:number){
        this.player = player;
        this.my_id = "-1";
        this.shadow_generator = shadow_generator;
        this.scene = scene
        this.render_distance = renderDistance;
        this.channel = io("wss://traine.servegame.com");
        this.handleMP();
        if(isNaN(this.player.rotationQuaternion.x)||isNaN(this.player.rotationQuaternion.y)||isNaN(this.player.rotationQuaternion.z)){
            //console.log("we got a problem :(")
        }
        else{
            var my_data:player_data = {
                position:this.player.absolutePosition,
                rotation:this.player.rotation,
                vel:this.player.physicsImpostor.getLinearVelocity()
            }
            this.channel.emit('position_update', my_data)
        }
    }
}

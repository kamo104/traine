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

import { PlayerData, PlayerInfo, PlayerSendInfo, SimpleVector } from "../Types";
import { GameGui } from "../gui/gui";

// game constants and variables
import {constants} from "../constants";
import {variables} from "../variables";
import { keyBindings } from "../keyBindings";

export class MPController{
    myId:string;
    channel:Socket;
    myModel:number;
    myName:string;
    playerList:{[id:number]:PlayerInfo} = {};

    private gameGui: GameGui;
    private scene:Scene;
    private shadowGenerator: CascadedShadowGenerator;
    private player: AbstractMesh;
    private loadedPlayers:{[key:string]:AbstractMesh} = {}; //map of loaded mp players
    private loadedPlayerMeshes:{[key:string]:AbstractMesh}; //map of possible meshes
    private playerSnaphots:{[key:string]:[v0:PlayerData,v1:PlayerData,v2:PlayerData]} = {};


    // function for checking validity of player data, returns true if valid, else false
    isPlayerDataValid(v:any): boolean{
        if(
            v.position==undefined||v.rotation==undefined||
            v.position.x==undefined||v.position.y==undefined||v.position.z==undefined||
            v.rotation.x==undefined||v.rotation.y==undefined||v.rotation.z==undefined ||
            isNaN(v.position.x)||isNaN(v.position.y)||isNaN(v.position.z)||
            isNaN(v.rotation.x)||isNaN(v.rotation.y)||isNaN(v.rotation.z)
            ) return false;
        return true;
    }
    // adds a player sent by server to player list, called when player joins the server
    addPlayer(playerInfo:PlayerSendInfo){
        this.playerList[playerInfo.id] = new PlayerInfo(playerInfo.model,playerInfo.name);
    }
    // loads a player mesh and text, called during position update from server
    loadPlayer(id:string, playerInfo:PlayerInfo, playerData:PlayerData){
        if(id in this.loadedPlayers) return;
        //console.log(this.loadedPlayerMeshes[playerData.model])
        var p = this.loadedPlayerMeshes[playerInfo.model].clone(id, null, true) //changing for asset manager based loading loadedPlayerMeshes
        p.position = new Vector3(playerData.position.x,playerData.position.y,playerData.position.z);
        p.isVisible = true;
        p.physicsImpostor = new PhysicsImpostor(
            p, 
            PhysicsImpostor.CapsuleImpostor, 
            { 
                mass: constants.CHARACTER_MASS as number, 
                restitution: constants.CHARACTER_RESTITUTION as number,
                friction: constants.CHARACTER_FRICTION as number,
            }, 
            this.scene);
        //for no collisions with other players
        //p.physicsImpostor.dispose();
        this.shadowGenerator.addShadowCaster(p);
        this.playerSnaphots[id] = [playerData,playerData,playerData]
        this.loadedPlayers[id]=p;

        //add overhead text to the player
        this.gameGui.playerGui.createPlayerText(p,playerInfo.name,id)
    }
    // removes the player from the player list and unloads him, called when player leaves the server
    removePlayer(id:string){
        this.unloadPlayer(id);
        delete this.playerList[id];
    }
    // unloads the player mesh and text, called when distance from main player is too great
    unloadPlayer(id:string){
        try{
            if((id in this.loadedPlayers)===false) return;
            // remove overhead text
            this.gameGui.playerGui.removePlayerText(id);

            this.shadowGenerator.removeShadowCaster(this.loadedPlayers[id], true);
            //console.log(loadedPlayers[id])
            this.loadedPlayers[id].dispose(false);
            delete this.playerSnaphots[id];
            delete this.loadedPlayers[id];
        }
        catch(err){
            console.log(err);
        }
    }
    // adds routines to the scene like snaphot interpolation or players standing upright
    addEngineRoutines():void{
        //snapshot interpolation and standing upright
        this.scene.onBeforeRenderObservable.add(()=>{
            // make each overhead name scale with distance to camera
            for (const key of Object.keys(this.loadedPlayers)){
                this.gameGui.playerGui.setGuiScaleOnPlayerFromCamera(key, this.loadedPlayers[key].absolutePosition);
            }

            //check if any of the loaded players is outside visible zone and unload him
            Object.entries(this.loadedPlayers).forEach(([id,mesh])=>{
                if(GMATH.positionDistanceSqrXZ(mesh.absolutePosition,this.player.absolutePosition)>constants.PLAYER_UNLOAD_DISTANCE*constants.PLAYER_UNLOAD_DISTANCE){
                    try{
                        this.unloadPlayer(id);
                        
                    }
                    catch(err){
                        // ?? add buffer on player disposition
                        console.log(err, "error when removing another player");
                    }
                }
            })

            //make players unable to fall over due to rotation
            for (const key of Object.keys(this.loadedPlayers)){
                const mesh = this.loadedPlayers[key];
                const rotation = mesh.rotationQuaternion.toEulerAngles();
                rotation.subtractFromFloats(rotation.x,0,rotation.z);
                
                mesh.rotationQuaternion = Quaternion.FromEulerVector(rotation);

            }

            //snapshot interpolation
            for (const key of Object.keys(this.playerSnaphots)){
                const mesh = this.loadedPlayers[key]
                
                // create position and rotation average over three last snapshots
                const avgPos = GMATH.positionAverage(
                    GMATH.deltaPosition(
                        this.playerSnaphots[key][2].position,
                        this.playerSnaphots[key][1].position),
                    GMATH.deltaPosition(
                        this.playerSnaphots[key][1].position,
                        this.playerSnaphots[key][0].position)
                );
                            
                const avgRot = GMATH.rotationAverage(
                    GMATH.deltaRotation(
                        this.playerSnaphots[key][2].rotation,
                        this.playerSnaphots[key][1].rotation),
                    GMATH.deltaPosition(
                        this.playerSnaphots[key][1].rotation,
                        this.playerSnaphots[key][0].rotation)
                );

                
                // create final position and rotation vector
                const resultPosition = new SimpleVector(
                    this.playerSnaphots[key][2].position.x+avgPos.x/20, // prop: this.scene.getAnimationRatio()*16.6
                    this.playerSnaphots[key][2].position.y+avgPos.y/20,
                    this.playerSnaphots[key][2].position.z+avgPos.z/20)
                
                    const resultRotation = new SimpleVector(
                    this.playerSnaphots[key][2].rotation.x+avgRot.x/20,
                    this.playerSnaphots[key][2].rotation.y+avgRot.y/20,
                    this.playerSnaphots[key][2].rotation.z+avgRot.z/20
                )

                // set the result position and rotation on the mesh
                mesh.rotationQuaternion = Quaternion.FromEulerAngles(resultRotation.x,resultRotation.y,resultRotation.z);
                mesh.position = new Vector3(resultPosition.x,resultPosition.y,resultPosition.z);

                // push back the vault values and set the lastest one after step
                this.playerSnaphots[key][0] = this.playerSnaphots[key][1];
                this.playerSnaphots[key][1] = this.playerSnaphots[key][2];
                this.playerSnaphots[key][2] = new PlayerData(resultPosition,resultRotation);
            }
        })
    }
    // adds routines like updating position and synchronizing players
    addChannelRoutines():void{
        this.channel.on("connect",()=>{
            console.log("connected to server")
        });
        this.channel.on("disconnect",()=>{
            console.log("disconnected from server")
        });
        // removes the player
        this.channel.on("player_left",(id:string)=>{
            this.removePlayer(id);
        });

        // adds the player
        this.channel.on("player_joined",(playerInfo:PlayerSendInfo)=>{
            if(playerInfo.id!==this.myId)
            this.addPlayer(playerInfo);
            
        })

        //gets the new player positions, sends position back and checks if there are any players to unload
        this.channel.on('position_data', (payload:{[k:string]:PlayerData}) => {
            //for each player in payload check validity of data and either create him or set snapshot of his pos
            Object.entries(payload).forEach(([k,v])=>{
                // console.log(payload)
                if(this.isPlayerDataValid(v)&&k!=this.myId){
                    if(k in this.loadedPlayers){
                        // set latest snapshot to his position
                        this.playerSnaphots[k][2] = v;
                    }
                    else{
                        // create new mesh if the player has been added
                        if(this.playerList[k]!==undefined) this.loadPlayer(k,this.playerList[k],v); // k in Object.keys(this.playerList)
                    }
                    
                }
            })

            //send your position back
            const myPosition = this.player.absolutePosition;
            let myRotation:any;
            if(this.player.rotationQuaternion) myRotation = this.player.rotationQuaternion;
            else myRotation = this.player.rotation
            const my_data:PlayerData = {position:{x:myPosition.x,y:myPosition.y,z:myPosition.z}, rotation:{x:myRotation.x,y:myRotation.y,z:myRotation.z}}
            this.channel.emit('position_update', my_data);


        });

        // on player sync gets any differences and adds or removes players if needed
        this.channel.on("syncPlayers",(players:{[key:number]:PlayerInfo})=>{
            this.playerList = players;
        });

        // on joining, the server sends current players
        this.channel.on("currentPlayers",(players:{[key:number]:PlayerInfo})=>{
            Object.entries(players).forEach(([k,v])=>{
                this.playerList[k] = v;
            })
        });
    }
    constructor(player: AbstractMesh, shadowGenerator: CascadedShadowGenerator, scene:Scene, myModel:number, loadedPlayerMeshes:{[key:number]:AbstractMesh}, myName:string, gameGui:GameGui){
        this.gameGui = gameGui;
        this.myName = myName;
        this.player = player;
        this.myId = "-1";
        this.shadowGenerator = shadowGenerator;
        this.scene = scene
        this.myModel = myModel;
        this.loadedPlayerMeshes = loadedPlayerMeshes;
        this.addEngineRoutines();
        this.channel = io(constants.WEBSOCKET_SERVER_NAME);
        this.addChannelRoutines();
    }
}

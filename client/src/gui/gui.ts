//gui import
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Button } from "@babylonjs/gui/2D/controls/button"
import { Container } from "@babylonjs/gui/2D/controls/container";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
//import { Grid } from "@babylonjs/gui/2D/controls/grid"
import {InputText} from "@babylonjs/gui/2D/controls/inputText"
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock"
import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh"
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"
import { Vector3 } from "@babylonjs/core/Maths/math.vector";


// import * as BABYLON from "@babylonjs/core"
import * as TRAINE from "../index"



export class BasicGui{
    createSimpleButton(direction:string){
        const button = Button.CreateImageOnlyButton("button","./textures/icons/arrow_" +direction+".svg");
        switch(direction){
            case("left"):{
                button.horizontalAlignment = 0;
                button.verticalAlignment =2;
                break;
            }
            case("right"):{
                button.horizontalAlignment = 1;
                button.verticalAlignment =2;
                break;
            }
        }
        
        button.alpha = 0.08;
        button.width = 1/15;
        button.height = 0.5;
        button.color = "transparent";
        button.cornerRadius = 20;
        
        button.onPointerEnterObservable.add(()=>{
            button.alpha = 0.5;
        })
        button.onPointerOutObservable.add(()=>{
            button.alpha = 0.08;
        })
        return(button);
    }
    createSimpleSlider(){

    }
    constructor(){
    }
}

export class ModelSelectorGui extends BasicGui{
    gui:AdvancedDynamicTexture;
    nextButton:Button;
    prevButton:Button;

    private guiPanel:Mesh;

    guiInit(){
        this.gui = AdvancedDynamicTexture.CreateForMesh(this.guiPanel);


        this.prevButton = super.createSimpleButton("left");
        this.gui.addControl(this.prevButton);

        this.nextButton = super.createSimpleButton("right");
        this.gui.addControl(this.nextButton);
    }
    dispose(){
        this.gui.dispose();
    }
    constructor( mesh:Mesh){
        super();

        this.guiPanel = mesh;
        this.guiInit();
    }
}
export class PlayerGui extends BasicGui{
    gui:AdvancedDynamicTexture;

    playerTextCollection:{[key:string]:TextBlock};
    private scene:Scene;
    // disposes of the player textblock
    removePlayerText(id: string){
        this.playerTextCollection[id].dispose();
        delete this.playerTextCollection[id];
    }
    // updates id of the given player with index
    updateId(id:string, new_id:string){
        if(this.playerTextCollection[id]===undefined) return;

        const playerTextBlock = this.playerTextCollection[id];
        delete this.playerTextCollection[id];
        var oldName = playerTextBlock.text;
        oldName = oldName.substring(0,oldName.length-id.length);
        playerTextBlock.text = oldName + new_id;
        this.playerTextCollection[new_id] = playerTextBlock;
    }

    // creates basic name and id on top of player using 
    createPlayerText(player:AbstractMesh, name:string, id:string){
        
        const info = player.getBoundingInfo();
        const ySize = info.boundingBox.extendSize.y*2;
        const offsetY = 0.2;
        const text = name + " #" + id;

        const planeLocation = new Vector3(0,ySize + offsetY,0);

        // let planeLocation = player.absolutePosition;
        // planeLocation.y = info.boundingBox.centerWorld.y + ySize + offsetY;

        // const guiPlane = MeshBuilder.CreatePlane(player.name + " gui", {width:text.length*0.7,height:2}, this.scene);
        // guiPlane.scaling = new Vector3(6,6,6);

        const guiPlane = MeshBuilder.CreatePlane(player.name + " gui", {}, this.scene);
        guiPlane.isVisible = false;

        const hoverText = new TextBlock(player.name + " name id", text);
        
        hoverText.color = "white";
        
        // var playerGui = AdvancedDynamicTexture.CreateForMesh(guiPlane);

        // playerGui.addControl(hoverText)
        this.gui.addControl(hoverText);
        hoverText.linkWithMesh(guiPlane);
        hoverText.isPointerBlocker = false;
        // hoverText.zIndex = 0;

        guiPlane.setParent(player, true);
        guiPlane.position = planeLocation;
        // guiPlane.rotation.y = Math.PI;
        this.playerTextCollection[id] = hoverText;

        return hoverText;
    }

    setGuiScaleOnPlayerFromCamera(player:string|TextBlock, playerPosition:Vector3){
        if(player instanceof TextBlock){
            return this.guiScaleSettingLogic(player as TextBlock, playerPosition);
        }
        else if(typeof player === "string"){
            return this.guiScaleSettingLogic(this.playerTextCollection[player as string], playerPosition);
        }
        
    }

    private guiScaleSettingLogic(textBlock:TextBlock, playerPosition:Vector3){
        var distanceToCamera = this.scene.activeCamera.globalPosition.subtract(playerPosition).length();

        distanceToCamera = distanceToCamera>TRAINE.constants.GUI_MINIMUM_SCALE_DISTANCE ? TRAINE.constants.GUI_MINIMUM_SCALE_DISTANCE : distanceToCamera;
        distanceToCamera = distanceToCamera<TRAINE.constants.GUI_MAXIMUM_SCALE_DISTANCE ? TRAINE.constants.GUI_MAXIMUM_SCALE_DISTANCE : distanceToCamera;

        const distanceOnSpan = distanceToCamera - TRAINE.constants.GUI_MAXIMUM_SCALE_DISTANCE;

        const result = Math.abs(distanceOnSpan*TRAINE.constants.GUI_DISTANCE_TO_SCALE_RATIO - TRAINE.constants.GUI_SCALE_SPAN);
        textBlock.scaleX = result;
        textBlock.scaleY = result;
    }
    
    constructor(scene:Scene, gui:AdvancedDynamicTexture){
        super();
        this.playerTextCollection = {};
        this.scene = scene;
        this.gui = gui;
    }
}

export class GameGui extends BasicGui{
    gui:AdvancedDynamicTexture;
    playerGui:PlayerGui;
    private scene:Scene;


    
    constructor(scene:Scene){
        super();
        this.scene = scene;
        this.gui = AdvancedDynamicTexture.CreateFullscreenUI("myUI",true,this.scene);
        this.playerGui = new PlayerGui(scene,this.gui);
    }
}





export class Gui{
    gui:AdvancedDynamicTexture;
    gameStartButton:Button;
    nameInput:InputText;
    rightMenuContainter:Container;
    private scene:Scene;
    
    

    guiInit(){
                
        this.gui = AdvancedDynamicTexture.CreateFullscreenUI("myUI",true,this.scene);


        var rightMenuContainer = new Container("rightSideGUI");
        rightMenuContainer.height =1;
        rightMenuContainer.width = 0.5;
        rightMenuContainer.horizontalAlignment = 1;
        rightMenuContainer.zIndex = 1000;
        rightMenuContainer.isPointerBlocker = false; //was true
        //rightMenuContainer.background = "black";

        //var cover = new Rectangle("GameCover");
        //cover.width =1;
        //cover.height = 1;
        //cover.background = "black";
        //cover.color = "black"
        //cover.isPointerBlocker = true;
        //this.gui.addControl(cover);

        var b1 = Button.CreateSimpleButton("log_in", "Log in");
        //button.textBlock.text = "Click to start"
        b1.width = 0.2*10/5;
        b1.height = 0.08
        b1.color = "white";
        b1.background = "black"
        b1.cornerRadius = 30;
        b1.fontSize = 30;
        b1.verticalAlignment =0;
        b1.top = window.innerHeight/4;
        b1.onPointerClickObservable.add(()=>{
            // this.gui.rootContainer.removeControl(rightMenuContainer)
        })

        var b2 = Button.CreateSimpleButton("play_as_guest","Play as a guest");
        b2.width = 0.2*10/5;
        b2.height = 0.08
        b2.color = "white";
        b2.background = "black"
        b2.cornerRadius = 30;
        b2.fontSize = 30;
        b2.verticalAlignment =0;
        b2.top = window.innerHeight/4+window.innerHeight/8;
        b2.onPointerClickObservable.add(()=>{
            // this.gui.rootContainer.removeControl(rightMenuContainer)
        })
        this.gameStartButton = b2;
        
        var input = new InputText("player_name");
        input.promptMessage = "Input your name"
        //input.disableMobilePrompt = true;
        input.width = 0.2*10/5;
        input.height = 0.08
        input.color = "white";
        input.background = "black";
        input.focusedBackground = "#212121"
        input.verticalAlignment =0;
        input.top = window.innerHeight/4+7*window.innerHeight/32;
        input.fontSize = 25;
        input.zIndex = 0;
        input.placeholderText = "Input your name";
        this.nameInput = input;

        var b3 = Button.CreateSimpleButton("options","Options");
        b3.width = 0.2*10/5;
        b3.height = 0.08
        b3.color = "white";
        b3.background = "black"
        b3.cornerRadius = 30;
        b3.fontSize = 30;
        b3.verticalAlignment =0;
        b3.top = window.innerHeight/4+7*window.innerHeight/32 +window.innerHeight/8;
        b3.onPointerClickObservable.add(()=>{
            //
        })

        var b4 = Button.CreateSimpleButton("about","About");
        b4.width = 0.2*10/5;
        b4.height = 0.08
        b4.color = "white";
        b4.background = "black"
        b4.cornerRadius = 30;
        b4.fontSize = 30;
        b4.verticalAlignment =0;
        b4.top = window.innerHeight/4+7*window.innerHeight/32 +2*window.innerHeight/8;
        b4.onPointerClickObservable.add(()=>{
            //
        })

        
        rightMenuContainer.addControl(b4);
        rightMenuContainer.addControl(b3);
        //rightMenuContainer.addControl(inputText)
        rightMenuContainer.addControl(input);    
        rightMenuContainer.addControl(b2);
        // rightMenuContainer.addControl(b1);
        
        this.rightMenuContainter = rightMenuContainer;
        this.gui.addControl(rightMenuContainer);
        
    }
    dispose(){
        this.gui.dispose();
    }
    constructor(scene:Scene){
        this.scene = scene;
        this.guiInit();
    }
}
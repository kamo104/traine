//gui import
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Button } from "@babylonjs/gui/2D/controls/button"
import { Container } from "@babylonjs/gui/2D/controls/container";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
//import { Grid } from "@babylonjs/gui/2D/controls/grid"
import {InputText} from "@babylonjs/gui/2D/controls/inputText"
import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

export class BasicGui{
    createSimpleButton(direction:string){
        var button = Button.CreateImageOnlyButton("button","./textures/icons/arrow_" +direction+".svg");
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












export class Gui{
    gui:AdvancedDynamicTexture;
    gameStartButton:Button;
    private scene:Scene;
    guiInit(){
                
        this.gui = AdvancedDynamicTexture.CreateFullscreenUI("myUI",true,this.scene);


        var rightMenuContainer = new Container("rightSideGUI");
        rightMenuContainer.height =1;
        rightMenuContainer.width = 0.5;
        rightMenuContainer.horizontalAlignment = 1;
        rightMenuContainer.isPointerBlocker = false; //was true
        //rightMenuContainer.background = "black";

        //var cover = new Rectangle("GameCover");
        //cover.width =1;
        //cover.height = 1;
        //cover.background = "black";
        //cover.color = "black"
        //cover.isPointerBlocker = true;
        //this.gui.addControl(cover);

        var button = Button.CreateSimpleButton("log_in", "Log in");
        //button.textBlock.text = "Click to start"
        button.width = 0.2*10/5;
        button.height = 0.08
        button.color = "white";
        button.background = "black"
        button.cornerRadius = 30;
        button.fontSize = 30;
        button.verticalAlignment =0;
        button.top = window.innerHeight/4;
        button.onPointerClickObservable.add(()=>{
            //this.gui.rootContainer.removeControl(cover)
            this.gui.rootContainer.removeControl(rightMenuContainer)
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
            //this.gui.rootContainer.removeControl(cover)
            this.gui.rootContainer.removeControl(rightMenuContainer)
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
        rightMenuContainer.addControl(button);
        
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
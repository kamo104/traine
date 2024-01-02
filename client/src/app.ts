'use strict';

//shared across all modules
import { Scene } from "@babylonjs/core/scene"
import { AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh"
import { Vector3,Color3,Color4} from "@babylonjs/core/Maths/math"

//assets Module
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager"
import "@babylonjs/loaders/OBJ/objFileLoader"
import "@babylonjs/loaders/glTF/2.0/glTFLoader"
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"
import { Mesh } from "@babylonjs/core/Meshes/mesh"

//shadows module
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator"
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent"

//camera module
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera"
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";

//materials module
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial"

//unique to app.ts
import { Engine } from "@babylonjs/core/Engines/engine"
import { WebGPUEngine } from "@babylonjs/core/Engines/webgpuEngine";

//light
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import "@babylonjs/core/Loading/loadingScreen";


//viewport
import { Viewport } from "@babylonjs/core/Maths/math";

//animation
import {Animation} from "@babylonjs/core/Animations/animation"
import "@babylonjs/core/Animations/animatable";
import {BezierCurveEase} from "@babylonjs/core/Animations/easing"

//GUI
import {Gui,ModelSelectorGui} from "./gui/gui";

import { Game } from "./game";

// game constants and variables
import {constants} from "./constants";
import {variables} from "./variables";
import { keyBindings } from "./keyBindings";

var canvas = document.querySelector("canvas");

var engine = new Engine(canvas, true, {deterministicLockstep: true, lockstepMaxSteps: 60,preserveDrawingBuffer: true, stencil: true});

// var engine = new WebGPUEngine(canvas, {deterministicLockstep: true, lockstepMaxSteps: 60, stencil: true});
// await engine.initAsync();

engine.enableOfflineSupport = false;

//on resize change size of canvas
window.addEventListener("resize", ()=>{ engine.resize() });


class App{
    loaded_player_meshes:{[key:string]:AbstractMesh};
    assetsManager:AssetsManager;
    scene:Scene;
    guiScene:Scene;
    gui:Gui;
    model_map:{[key:string]:string};
    my_model:number;
    my_name:string;

    game:Game;

    
    //creates the main scene, assetsManager, gui, guiScene
    async modelSelector(){
        this.my_model = 0;
        this.scene = new Scene(engine);
        this.scene.clearColor = new Color4(0,0,0,1);
        this.scene.useRightHandedSystem = true;
        //assets manager and load player meshes
        this.assetsManager = new AssetsManager(this.scene);
        await this.loadPlayerMeshes();
        // await this.loadMaleModels();

        var playerMeshesParent = MeshBuilder.CreateBox("playerMeshesParent",{},this.scene);
        const rotationRadius = 10;
        playerMeshesParent.position = new Vector3(0,0,rotationRadius);
        playerMeshesParent.isVisible = false;
        var angle =0;
        Object.entries(this.loaded_player_meshes).forEach(([id,mesh])=>{
            mesh.isVisible = true;
            mesh.position = new Vector3(rotationRadius*Math.sin(-angle),0,-rotationRadius*Math.cos(-angle)+rotationRadius)
            mesh.rotation.y = angle;
            mesh.setParent(playerMeshesParent);
            angle += 2*Math.PI/Object.keys(this.loaded_player_meshes).length
        })

        var ground = MeshBuilder.CreateDisc("ground",{radius:100},this.scene);
        ground.rotation.x = Math.PI/2
        ground.receiveShadows = true;
        const material = new StandardMaterial("ground_material",this.scene)
        material.diffuseColor = new Color3(17/255, 46/255, 20/255); //was (33/255, 38/255, 105/255);
        ground.material = material;
        const light1 = new SpotLight("spotLight", new Vector3(1, 7, -1), new Vector3(-1, -3.5, 1), 2*Math.PI/3, 10, this.scene);
        //var light2 = new SpotLight("spotLight", new Vector3(-1, 7, 1), new Vector3(1, -3.5, -1), Math.PI, 10, this.scene);
        light1.intensity = 1;
        //light2.intensity = 0.5;
        this.scene.shadowsEnabled = true;
        const shadowGenerator = new ShadowGenerator(4096,light1);
        Object.entries(this.loaded_player_meshes).forEach(([id,mesh])=>{
            shadowGenerator.addShadowCaster(mesh);
        })
        
        //const light2 = new HemisphericLight("light2", new Vector3(0.5, 1, -1), this.scene);


        var browserCam = new ArcRotateCamera(
            "browserCam",
            constants.BROWSER_CAMERA_ALPHA, 
            constants.BROWSER_CAMERA_BETA, 
            constants.BROWSER_CAMERA_DEFAULT_RADIUS,
            new Vector3(
                constants.BROWSER_CAMERA_TARGET_X,
                constants.BROWSER_CAMERA_TARGET_Y,
                constants.BROWSER_CAMERA_TARGET_Z),
            this.scene) //1,417, target = 1.5
        //browserCam.radius = this.loaded_player_meshes[0].getBoundingInfo().boundingSphere.maximum.lengthSquared();
        browserCam.upperBetaLimit = constants.BROWSER_CAMERA_UPPERBETALIMIT;
        browserCam.lowerRadiusLimit = constants.BROWSER_CAMERA_LOWERRADIUSLIMIT;
        browserCam.upperRadiusLimit = constants.BROWSER_CAMERA_UPPERRADIUSLIMIT;
        browserCam.wheelPrecision = constants.BROWSER_CAMERA_WHEELPRECISION;
        browserCam.angularSensibilityX = constants.BROWSER_CAMERA_ANGULARSENSIBILITY_X;
        browserCam.angularSensibilityY = constants.BROWSER_CAMERA_ANGULARSENSIBILITY_Y;
        browserCam.viewport = new Viewport(
            constants.BROWSER_CAMERA_VIEWPORT_X,
            constants.BROWSER_CAMERA_VIEWPORT_Y,
            constants.BROWSER_CAMERA_VIEWPORT_W,
            constants.BROWSER_CAMERA_VIEWPORT_H);
        browserCam.attachControl(canvas,true,false);


        var guiPanel = MeshBuilder.CreatePlane("guiPanel",{size:1},this.scene)
        guiPanel.position.y +=1;
        guiPanel.rotation.y = Math.PI;
        guiPanel.scaling.x = 1.5;
        guiPanel.scaling.y = 1.5;
        // guiPanel.scaling.x = this.loaded_player_meshes[0].getBoundingInfo().boundingSphere.maximum.x*3;
        // guiPanel.scaling.y = this.loaded_player_meshes[0].getBoundingInfo().boundingSphere.maximum.y;
        
        const startingAlpha = browserCam.alpha

        //make the panel always face camera
        this.scene.onBeforeRenderObservable.add(()=>{
            guiPanel.rotation.y = (2*Math.PI)*Math.floor((browserCam.alpha-startingAlpha)/(2*Math.PI)) -(browserCam.alpha-startingAlpha)-startingAlpha+Math.PI/2;
        })


        var selectorGui = new ModelSelectorGui(guiPanel);
        
        var animationDone = true;
        var animQueue =0;

        //function for animation of character switching in selection
        //*direction is either 1 or -1
        const animateSelectionChange = (direction:number,modelBefore:number)=>{
            var modelAfter = (modelBefore+direction)%(Object.keys(this.loaded_player_meshes).length);
            if(modelAfter<0) modelAfter = Object.keys(this.loaded_player_meshes).length+modelAfter;

            //shadowGenerator.addShadowCaster(this.loaded_player_meshes[modelAfter]);

            //caroussel animation
            animationDone=false;
            var parentRotationAnimation = new Animation("parentRotation", "rotation.y", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
            var parentKeyframes = [{
                frame : 0,
                value : playerMeshesParent.rotation.y
            }, {
                frame : 80,
                value : playerMeshesParent.rotation.y - direction*2*Math.PI/Object.keys(this.loaded_player_meshes).length
            }];
            parentRotationAnimation.setKeys(parentKeyframes);
            parentRotationAnimation.setEasingFunction(new BezierCurveEase(.64,.22,.39,.84))
            playerMeshesParent.animations.push(parentRotationAnimation);

            
            this.scene.beginAnimation(playerMeshesParent, 0, 80, false, 1,()=>{animationDone = true;});
        }
        //either animate right or add to queue
        selectorGui.nextButton.onPointerClickObservable.add(()=>{
            if(!animationDone){
                animQueue +=1;
                return
            }
            animateSelectionChange(1,this.my_model);
            this.my_model = (this.my_model+1)%(Object.keys(this.loaded_player_meshes).length);
            if(this.my_model<0) this.my_model = Object.keys(this.loaded_player_meshes).length+this.my_model;
            
        });
        
        //either animate left or add to queue
        selectorGui.prevButton.onPointerClickObservable.add(()=>{
            if(!animationDone){
                animQueue -=1;
                return
            }
            animateSelectionChange(-1,this.my_model);
            this.my_model = (this.my_model-1)%(Object.keys(this.loaded_player_meshes).length);
            if(this.my_model<0) this.my_model = Object.keys(this.loaded_player_meshes).length+this.my_model;
            
        });

        //handle animation queue
        this.scene.onBeforeRenderObservable.add(()=>{
            if(!animationDone) return;
            if(animQueue===0) return;
            else if(animQueue>0){
                animQueue-=1;
                animateSelectionChange(1,this.my_model);
                this.my_model = (this.my_model+1)%(Object.keys(this.loaded_player_meshes).length);
                if(this.my_model<0) this.my_model = Object.keys(this.loaded_player_meshes).length+this.my_model;
            }
            else{
                animQueue+=1;
                animateSelectionChange(-1,this.my_model);
                this.my_model = (this.my_model-1)%(Object.keys(this.loaded_player_meshes).length);
                if(this.my_model<0) this.my_model = Object.keys(this.loaded_player_meshes).length+this.my_model;
            }
        })
        
        this.guiScene = new Scene(engine);
        this.guiScene.autoClear = false;
        new UniversalCamera("guicamera",Vector3.Zero(),this.guiScene); //.inputs.attached

        this.gui = new Gui(this.guiScene);

        engine.runRenderLoop(() => { 
            this.scene.render();
            this.guiScene.render();
            
        });
        

        const disposeModelSelector = ()=>{
            this.scene.onBeforeRenderObservable.clear();
            this.scene.stopAllAnimations();
            engine.stopRenderLoop();
            //this.guiScene.dispose();
            selectorGui.dispose();
            guiPanel.dispose();
            ground.material.dispose();
            ground.dispose();
            light1.dispose();
            //light2.dispose();
            browserCam.dispose();
            
            //default the loaded meshes
            Object.entries(this.loaded_player_meshes).forEach(([id,mesh])=>{
                mesh.isVisible = false;
                mesh.setParent(null);
                mesh.rotation.y = 0;
                shadowGenerator.removeShadowCaster(mesh);
                mesh.receiveShadows = false;
            })
            shadowGenerator.dispose();

            playerMeshesParent.dispose();
        }
                
        //get rid of the temporary scene and set meshes options to default, initialize the game
        const startGame = ()=>{
            this.gui.gui.removeControl(this.gui.rightMenuContainter);
            this.my_name = this.gui.nameInput.text;
            
            disposeModelSelector()
            if(this.my_model<0) this.my_model = Object.keys(this.loaded_player_meshes).length+this.my_model;

            this.gameStart();
        }
        
        if(constants.GAME_INIT_ON_LOAD)startGame();

        this.gui.gameStartButton.onPointerClickObservable.add(startGame);
    }

    // loads all player meshes for later use
    async loadPlayerMeshes(): Promise<void>{
        const playermodelMapReq = await fetch("./assets/player_models/playerModelMap.json")
        this.model_map = await playermodelMapReq.json()

        this.loaded_player_meshes = {};
        Object.entries(this.model_map).forEach(([index,mesh_name])=>{
            var mt1 = this.assetsManager.addMeshTask("load" + mesh_name, "", "./assets/player_models/", mesh_name +".obj");
            mt1.onSuccess = (task)=>{
                var p = task.loadedMeshes[0];
                p.isVisible =false;
                p.position = Vector3.Zero();
                p.receiveShadows = true;
                this.loaded_player_meshes[index] = p;
            }
            
        })
        await this.assetsManager.loadAsync();
    }

    // starts the game by creating a game object and running a render loop
    async gameStart(){
        //add game object
        this.game = new Game(this.scene,this.guiScene,this.gui,this.assetsManager,this.loaded_player_meshes,this.my_model, this.my_name);
        await this.game.gameStart();

        // debug
        if(constants.DEBUG_MODE) this.game.inspectorInit(this.scene);

        engine.runRenderLoop(()=>{
            this.scene.render();
            this.guiScene.render();
        })
        
    }
    //loads from glb and sorts the models accordingly
    async loadMaleModels(){
        const males_info = await fetch("./assets/player_models/males_info.json");

        const model_map:{[key:string]:string[]} = await males_info.json();

        this.loaded_player_meshes = {};

        for(let i=0;i<model_map.models.length;i++){
            const name = model_map.models[i];
            var parentMesh = new AbstractMesh(name);
            parentMesh.isVisible = false;
            this.loaded_player_meshes[name] = parentMesh;

            // console.log("here")
        }
        

        const mt = this.assetsManager.addMeshTask("addMaleModels","","/assets/player_models/", "Humans_master.glb");
        mt.onSuccess = (task)=>{
            // console.log(task.loadedSkeletons)

            const idleAnimation = task.loadedAnimationGroups.find((anim)=>{if (anim.name==="Idle_Neutral") return(true) })
            idleAnimation.play(true)


            task.loadedMeshes.forEach((v)=>{
                // v.isVisible = false;

                //go over every male model and check which one this part belongs to
                model_map.models.forEach((name)=>{
                    if(v.name.includes(name)){
                        this.loaded_player_meshes[name].addChild(v);
                    }
                })
                model_map.misc.forEach((name)=>{
                    if(v.name.includes(name)){
                        v.isVisible=false;
                    }
                })
            })
            
        }
        await this.assetsManager.loadAsync();
    }
    constructor(){
        this.modelSelector();
    }
}

let app = new App();



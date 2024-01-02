import * as BABYLON from "@babylonjs/core"


import Ammo  from "ammojs-typed"

import { initDistanceMaterial } from "../materials/distanceMaterial"


const setOrthoSize = function(camera:BABYLON.FreeCamera, size:BABYLON.Vector4){
    camera.orthoTop = size.x;
    camera.orthoRight = size.y;
    camera.orthoBottom = size.z;
    camera.orthoLeft = size.w;
}

const setCameraPositon = function(camera:BABYLON.FreeCamera, position:BABYLON.Vector3){
    camera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;
    camera.position = position;
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
}


class GrassWorker{
    canvas: WebGLRenderingContext | HTMLCanvasElement | OffscreenCanvas | WebGL2RenderingContext;
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    camera: BABYLON.FreeCamera;
    assetsManager: BABYLON.AssetsManager;

    Init(canvas:WebGLRenderingContext | HTMLCanvasElement | OffscreenCanvas | WebGL2RenderingContext){
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(canvas)
        this.scene = new BABYLON.Scene(this.engine);
        this.assetsManager = new BABYLON.AssetsManager(this.scene);
    }

    sceneInit(){
    
        worker.camera = new BABYLON.FreeCamera("cam",new BABYLON.Vector3(0,30,0),this.scene);
        worker.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        
        
        worker.camera.setTarget(BABYLON.Vector3.Zero());

        worker.camera.attachControl(this.canvas, true);


    
        const light = new BABYLON.HemisphericLight("light",BABYLON.Vector3.Up(),this.scene);
    
        this.engine.runRenderLoop(()=>{this.scene.render()})
        
    }


    async physicsEnable(){
        const ammo = await Ammo();

        const physicsPlugin = new BABYLON.AmmoJSPlugin(true, ammo);
        
        const gravity = new BABYLON.Vector3(0,-9.81,0);

        this.scene.enablePhysics(gravity,physicsPlugin);
    }

    constructor(){
        
    }
}

var worker = new GrassWorker();


self.onmessage = async ( evt ) => { // evt == { data: { args: [texture,objectUrl]} }
    const data = evt.data;

    if(data.canvas!==undefined){
        worker.Init(data.canvas);
        await worker.physicsEnable();
        worker.sceneInit();

        return;
    }

    if(data.args===undefined) return;

    

    const texture = data.args[0];
    const objectUrl = data.args[1];
    var mesh: BABYLON.AbstractMesh;
    worker.assetsManager.addMeshTask("loadMesh","",objectUrl,"",".babylon").onSuccess = (task)=>{
        mesh = task.loadedMeshes[0];
        
        const boundingInfo = mesh.getBoundingInfo()
        const maximumWorld = boundingInfo.boundingBox.maximumWorld;
        const minimumWorld = boundingInfo.boundingBox.minimumWorld;

        const cameraPosition = new BABYLON.Vector3(mesh.absolutePosition.x,mesh.absolutePosition.y+Math.abs(maximumWorld.y-minimumWorld.y)*2,mesh.absolutePosition.z);
        setCameraPositon(worker.camera, cameraPosition);
        
        setOrthoSize(worker.camera, new BABYLON.Vector4(maximumWorld.z,maximumWorld.x,minimumWorld.z,minimumWorld.x));

        const material = initDistanceMaterial(worker.scene);

        mesh.material = material
    
        worker.scene.onBeforeRenderObservable.add(()=>{
            material.setFloat('maxDistance',Math.abs(cameraPosition.y-minimumWorld.y));
            material.setFloat('viewerY',cameraPosition.y);
        })
        
    };

    await worker.assetsManager.loadAsync();


    const render = new BABYLON.RenderTargetTexture("screen",1000,worker.scene,{type:BABYLON.Constants.TEXTURETYPE_FLOAT}); // ,{type:BABYLON.Constants.TEXTURETYPE_FLOAT, format:BABYLON.Constants.TEXTUREFORMAT_RGBA}
    

    

    // worker.scene.customRenderTargets.push(render);

    // render.activeCamera = worker.camera;

    // render.render();

    render.renderList.push(mesh);
    
    worker.scene.customRenderTargets.push(render);

    render.activeCamera = worker.camera;

    

    const pixelsAndSend = ()=>{
        render.readPixels().then((buffer)=>{
            self.postMessage({
                matrices : buffer
            });
        }) 
    }



    var i=0;
    const obs = worker.scene.onAfterRenderObservable.add(()=>{
        i++;
        render.render();
        if(i==5){
            pixelsAndSend();
            worker.scene.onAfterRenderObservable.remove(obs);
        }
    })


    
  };
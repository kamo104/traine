
import * as BABYLON from "@babylonjs/core"

const vertFX = require("!!raw-loader!./distVertex.glsl").default;
const fragFX = require("!!raw-loader!./distFrag.glsl").default;



export function initDistanceMaterial(scene:BABYLON.Scene, name?:string){
    if (name === undefined) name = "distance"
    BABYLON.Effect.ShadersStore['distanceVertexShader'] = vertFX;
    BABYLON.Effect.ShadersStore['distanceFragmentShader'] = fragFX;

    var material = new BABYLON.ShaderMaterial( name, scene, {
        vertexElement: "distance",
        fragmentElement: "distance",
        // vertexSource: vertFX,
        // fragmentSource: fragFX
    },
    {
        attributes: ["position"],
        uniforms: ["world","worldViewProjection", "maxDistance", "viewerY"]
    });

    return material;
}


// setMaxDistance(maxDistance:number){
//     this.material.setFloat('maxDistance',maxDistance);
// }

// setViewerY(viewerY:number){
//     this.material.setFloat('viewerY', viewerY)
// }

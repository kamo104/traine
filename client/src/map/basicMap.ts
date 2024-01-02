
//shared across all modules
import {Scene} from "@babylonjs/core/scene"
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import {Color3, Vector3} from "@babylonjs/core/Maths/math"

//shadows module
import { CascadedShadowGenerator } from "@babylonjs/core/Lights/Shadows/cascadedShadowGenerator"

//assets Module
import { AssetsManager } from '@babylonjs/core/Misc/assetsManager';

export interface BasicMap{

    loadMap(continuous?:boolean): Promise<void>;
    chunkmapDownload(): Promise<void>;
    mapLoadingLogic(): Promise<void>;
}